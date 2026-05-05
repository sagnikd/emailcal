import { useCallback, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { Profile, Team } from '../types'
import { supabase } from '../lib/supabase'

const SUPERADMIN_EMAIL = 'datta.sagnik129@gmail.com'

type ProfileRow = {
  user_id: string
  email: string
  full_name: string
  is_superadmin: boolean
  current_team_id: string | null
}

type TeamRow = {
  id: string
  name: string
  slug: string
  created_at: string
}

type TeamMemberRow = {
  team_id: string
  user_id: string
}

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    isSuperadmin: row.is_superadmin,
    currentTeamId: row.current_team_id,
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const loadWorkspaceContext = useCallback(async (nextSession: Session | null) => {
    if (!supabase) {
      setError('Supabase is not configured.')
      setIsLoading(false)
      return
    }

    setSession(nextSession)

    if (!nextSession?.user) {
      setProfile(null)
      setTeams([])
      setActiveTeamId(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const user = nextSession.user
    const fallbackName =
      (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
      user.email?.split('@')[0] ||
      'Teammate'

    const upsertProfile = await supabase.from('profiles').upsert({
      user_id: user.id,
      email: user.email ?? '',
      full_name: fallbackName,
      is_superadmin: (user.email ?? '').toLowerCase() === SUPERADMIN_EMAIL,
    }, { onConflict: 'user_id' })

    if (upsertProfile.error) {
      setError(upsertProfile.error.message)
      setIsLoading(false)
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, is_superadmin, current_team_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      setError(profileError.message)
      setIsLoading(false)
      return
    }

    if (!profileData) {
      setError('Could not load your profile.')
      setIsLoading(false)
      return
    }

    const nextProfile = mapProfile(profileData as ProfileRow)
    setProfile(nextProfile)

    if (nextProfile.isSuperadmin) {
      const [{ data: teamRows, error: teamError }, { data: teamMemberRows, error: memberError }] = await Promise.all([
        supabase.from('teams').select('id, name, slug, created_at').order('created_at'),
        supabase.from('team_members').select('team_id, user_id'),
      ])

      if (teamError || memberError) {
        setError(teamError?.message ?? memberError?.message ?? 'Could not load teams.')
        setIsLoading(false)
        return
      }

      const counts = new Map<string, number>()
      ;((teamMemberRows as TeamMemberRow[] | null) ?? []).forEach(member => {
        counts.set(member.team_id, (counts.get(member.team_id) ?? 0) + 1)
      })

      const mappedTeams = ((teamRows as TeamRow[] | null) ?? []).map(team => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        memberCount: counts.get(team.id) ?? 0,
      }))

      setTeams(mappedTeams)
      setActiveTeamId(nextProfile.currentTeamId ?? mappedTeams[0]?.id ?? null)
      setIsLoading(false)
      return
    }

    const [{ data: memberships, error: membershipError }, { data: teamMemberRows, error: memberCountError }] = await Promise.all([
      supabase
        .from('team_members')
        .select('team_id, teams!inner(id, name, slug)')
        .eq('user_id', user.id),
      supabase.from('team_members').select('team_id, user_id'),
    ])

    if (membershipError || memberCountError) {
      setError(membershipError?.message ?? memberCountError?.message ?? 'Could not load your team workspace.')
      setIsLoading(false)
      return
    }

    const counts = new Map<string, number>()
    ;((teamMemberRows as TeamMemberRow[] | null) ?? []).forEach(member => {
      counts.set(member.team_id, (counts.get(member.team_id) ?? 0) + 1)
    })

    const rawMemberships = ((memberships as Array<{ team_id: string; teams: TeamRow[] | TeamRow }> | null) ?? [])
    if (rawMemberships.length === 0) {
      const fallbackTeamName =
        nextProfile.fullName?.trim()
          ? `${nextProfile.fullName.split(' ')[0]}'s Workspace`
          : `${(nextProfile.email.split('@')[0] || 'Team').replace(/[._-]+/g, ' ')} Workspace`

      const { error: bootstrapError } = await supabase.rpc('bootstrap_team_signup', {
        p_team_name: fallbackTeamName,
        p_full_name: nextProfile.fullName || fallbackName,
      })

      if (bootstrapError) {
        setError(bootstrapError.message)
        setIsLoading(false)
        return
      }

      await loadWorkspaceContext(nextSession)
      return
    }

    const mappedTeams = rawMemberships
      .map(row => {
        const team = Array.isArray(row.teams) ? row.teams[0] : row.teams
        if (!team) return null

        return {
          id: team.id,
          name: team.name,
          slug: team.slug,
          memberCount: counts.get(row.team_id) ?? 0,
        }
      })
      .filter((team): team is Team => team !== null)

    setTeams(mappedTeams)
    setActiveTeamId(nextProfile.currentTeamId ?? mappedTeams[0]?.id ?? null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      setError('Supabase is not configured.')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      void loadWorkspaceContext(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void loadWorkspaceContext(nextSession)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [loadWorkspaceContext])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return
    setError(null)
    setInfo(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) setError(signInError.message)
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string, teamName: string) => {
    if (!supabase) return
    setError(null)
    setInfo(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (!data.session) {
      setInfo('Account created. Complete email confirmation, then sign in to create your team workspace.')
      return
    }

    const { error: bootstrapError } = await supabase.rpc('bootstrap_team_signup', {
      p_team_name: teamName,
      p_full_name: fullName,
    })

    if (bootstrapError) {
      setError(bootstrapError.message)
      return
    }

    await loadWorkspaceContext(data.session)
  }, [loadWorkspaceContext])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setError(null)
    await supabase.auth.signOut()
  }, [])

  const switchTeam = useCallback(async (teamId: string) => {
    if (!supabase || !session?.user || !profile) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_team_id: teamId })
      .eq('user_id', session.user.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setProfile({ ...profile, currentTeamId: teamId })
    setActiveTeamId(teamId)
  }, [profile, session])

  return {
    session,
    profile,
    teams,
    activeTeamId,
    isLoading,
    error,
    info,
    signIn,
    signUp,
    signOut,
    switchTeam,
    reload: () => loadWorkspaceContext(session),
  }
}
