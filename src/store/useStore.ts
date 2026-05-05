import { useState, useCallback, useEffect } from 'react'
import { AppState, Campaign, EmailCard, ViewMode } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const CAMPAIGN_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4']

type SegmentRow = {
  id: string
  team_id: string
  name: string
}

type CampaignRow = {
  id: string
  team_id: string
  name: string
  color: string
  start_date: string
  end_date: string
  goal: string
  segments: string[]
}

type EmailRow = {
  id: string
  team_id: string
  subject: string
  send_date: string
  segment: string[]
  campaign_id: string
  email_type: EmailCard['emailType']
  status: EmailCard['status']
  owner: string
  preview_text: string
  notes: string
}

type CommentRow = {
  id: string
  team_id: string
  email_id: string
  author: string
  body: string
  created_at: string
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    startDate: row.start_date,
    endDate: row.end_date,
    goal: row.goal,
    segments: row.segments,
  }
}

function mapComment(row: CommentRow) {
  return {
    id: row.id,
    author: row.author,
    text: row.body,
    timestamp: row.created_at,
  }
}

function mapEmail(row: EmailRow, comments: CommentRow[]): EmailCard {
  return {
    id: row.id,
    subject: row.subject,
    sendDate: row.send_date,
    segment: row.segment,
    campaignId: row.campaign_id,
    emailType: row.email_type,
    status: row.status,
    owner: row.owner,
    previewText: row.preview_text,
    notes: row.notes,
    comments: comments
      .filter(comment => comment.email_id === row.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(mapComment),
  }
}

const emptyState: AppState = {
  segments: [],
  campaigns: [],
  emails: [],
  selectedCampaignId: null,
  selectedSegment: null,
  view: 'month',
  currentDate: new Date(),
}

export function useStore(teamId: string | null, commentAuthor: string) {
  const [state, setState] = useState<AppState>(emptyState)
  const [isLoading, setIsLoading] = useState(Boolean(teamId && isSupabaseConfigured))
  const [error, setError] = useState<string | null>(
    isSupabaseConfigured ? null : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect the app to your database.'
  )

  const loadData = useCallback(async () => {
    if (!supabase) return

    if (!teamId) {
      setState(s => ({
        ...s,
        segments: [],
        campaigns: [],
        emails: [],
        selectedCampaignId: null,
        selectedSegment: null,
      }))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const [
      { data: segmentsData, error: segmentsError },
      { data: campaignsData, error: campaignsError },
      { data: emailsData, error: emailsError },
      { data: commentsData, error: commentsError },
    ] = await Promise.all([
      supabase.from('segments').select('id, team_id, name').eq('team_id', teamId).order('name'),
      supabase.from('campaigns').select('id, team_id, name, color, start_date, end_date, goal, segments').eq('team_id', teamId).order('created_at'),
      supabase.from('emails').select('id, team_id, subject, send_date, segment, campaign_id, email_type, status, owner, preview_text, notes').eq('team_id', teamId).order('send_date'),
      supabase.from('comments').select('id, team_id, email_id, author, body, created_at').eq('team_id', teamId).order('created_at'),
    ])

    const firstError = segmentsError ?? campaignsError ?? emailsError ?? commentsError
    if (firstError) {
      setError(firstError.message)
      setIsLoading(false)
      return
    }

    setState(s => ({
      ...s,
      segments: ((segmentsData as SegmentRow[] | null) ?? []).map(segment => segment.name),
      campaigns: ((campaignsData as CampaignRow[] | null) ?? []).map(mapCampaign),
      emails: ((emailsData as EmailRow[] | null) ?? []).map(email => mapEmail(email, ((commentsData as CommentRow[] | null) ?? []))),
    }))
    setIsLoading(false)
  }, [teamId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const addEmail = useCallback(async (email: Omit<EmailCard, 'id' | 'comments'>) => {
    if (!supabase || !teamId) return

    const { error: insertError } = await supabase.from('emails').insert({
      team_id: teamId,
      subject: email.subject,
      send_date: new Date(email.sendDate).toISOString(),
      segment: email.segment,
      campaign_id: email.campaignId,
      email_type: email.emailType,
      status: email.status,
      owner: email.owner,
      preview_text: email.previewText,
      notes: email.notes,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadData()
  }, [loadData, teamId])

  const updateEmail = useCallback(async (id: string, updates: Partial<EmailCard>) => {
    if (!supabase || !teamId) return

    const payload: Record<string, unknown> = {}
    if (updates.subject !== undefined) payload.subject = updates.subject
    if (updates.sendDate !== undefined) payload.send_date = new Date(updates.sendDate).toISOString()
    if (updates.segment !== undefined) payload.segment = updates.segment
    if (updates.campaignId !== undefined) payload.campaign_id = updates.campaignId
    if (updates.emailType !== undefined) payload.email_type = updates.emailType
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.owner !== undefined) payload.owner = updates.owner
    if (updates.previewText !== undefined) payload.preview_text = updates.previewText
    if (updates.notes !== undefined) payload.notes = updates.notes

    const { error: updateError } = await supabase.from('emails').update(payload).eq('id', id).eq('team_id', teamId)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await loadData()
  }, [loadData, teamId])

  const deleteEmail = useCallback(async (id: string) => {
    if (!supabase || !teamId) return

    const { error: deleteError } = await supabase.from('emails').delete().eq('id', id).eq('team_id', teamId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadData()
  }, [loadData, teamId])

  const addCampaign = useCallback(async (campaign: Omit<Campaign, 'id' | 'color'>) => {
    if (!supabase || !teamId) return

    const color = CAMPAIGN_COLORS[Math.floor(Math.random() * CAMPAIGN_COLORS.length)]
    const { error: insertError } = await supabase.from('campaigns').insert({
      team_id: teamId,
      name: campaign.name,
      color,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      goal: campaign.goal,
      segments: campaign.segments,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadData()
  }, [loadData, teamId])

  const renameCampaign = useCallback(async (id: string, newName: string) => {
    if (!supabase || !teamId) return
    const trimmed = newName.trim()
    if (!trimmed) return

    const { error: updateError } = await supabase.from('campaigns').update({ name: trimmed }).eq('id', id).eq('team_id', teamId)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await loadData()
  }, [loadData, teamId])

  const addSegment = useCallback(async (name: string) => {
    if (!supabase || !teamId) return
    const trimmed = name.trim()
    if (!trimmed) return

    const { error: insertError } = await supabase.from('segments').insert({ team_id: teamId, name: trimmed })

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadData()
  }, [loadData, teamId])

  const renameSegment = useCallback(async (oldName: string, newName: string) => {
    if (!supabase || !teamId) return
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return

    const [segmentResult, campaignsResult, emailsResult] = await Promise.all([
      supabase.from('segments').update({ name: trimmed }).eq('name', oldName).eq('team_id', teamId),
      supabase.rpc('rename_segment_in_campaigns', { p_team_id: teamId, old_name: oldName, new_name: trimmed }),
      supabase.rpc('rename_segment_in_emails', { p_team_id: teamId, old_name: oldName, new_name: trimmed }),
    ])

    const firstError = segmentResult.error ?? campaignsResult.error ?? emailsResult.error
    if (firstError) {
      setError(firstError.message)
      return
    }

    setState(s => ({
      ...s,
      selectedSegment: s.selectedSegment === oldName ? trimmed : s.selectedSegment,
    }))
    await loadData()
  }, [loadData, teamId])

  const addComment = useCallback(async (emailId: string, _author: string, text: string) => {
    if (!supabase || !teamId) return

    const { error: insertError } = await supabase.from('comments').insert({
      team_id: teamId,
      email_id: emailId,
      author: commentAuthor || 'Teammate',
      body: text,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadData()
  }, [commentAuthor, loadData, teamId])

  const setView = useCallback((view: ViewMode) => setState(s => ({ ...s, view })), [])
  const setCurrentDate = useCallback((d: Date) => setState(s => ({ ...s, currentDate: d })), [])
  const setSelectedCampaign = useCallback((id: string | null) => setState(s => ({ ...s, selectedCampaignId: id })), [])
  const setSelectedSegment = useCallback((seg: string | null) => setState(s => ({ ...s, selectedSegment: seg })), [])

  const getConflicts = useCallback((email: EmailCard): boolean => {
    const date = new Date(email.sendDate)
    const windowMs = 48 * 60 * 60 * 1000
    return state.emails.some(e =>
      e.id !== email.id &&
      e.segment.some(s => email.segment.includes(s)) &&
      Math.abs(new Date(e.sendDate).getTime() - date.getTime()) < windowMs
    )
  }, [state.emails])

  return {
    state,
    isLoading,
    error,
    addEmail,
    updateEmail,
    deleteEmail,
    addCampaign,
    renameCampaign,
    addSegment,
    renameSegment,
    addComment,
    setView,
    setCurrentDate,
    setSelectedCampaign,
    setSelectedSegment,
    getConflicts,
    reload: loadData,
  }
}
