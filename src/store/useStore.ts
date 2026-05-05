import { useState, useCallback, useEffect } from 'react'
import { AppState, Campaign, EmailCard, ViewMode } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const CAMPAIGN_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4']

export const DEFAULT_SEGMENTS = [
  'All Subscribers',
  'New Users',
  'VIP Members',
  'Inactive Users',
  'Trial Users',
  'Engaged Readers',
  'Churned Users',
]

const defaultCampaigns: Campaign[] = [
  { id: 'c1', name: 'Summer Sale', color: '#3b82f6', startDate: '2026-05-01', endDate: '2026-05-31', goal: 'Drive Q2 revenue', segments: ['All Subscribers', 'VIP Members'] },
  { id: 'c2', name: 'Onboarding Drip', color: '#8b5cf6', startDate: '2026-05-01', endDate: '2026-06-30', goal: 'Activate new users', segments: ['New Users', 'Trial Users'] },
  { id: 'c3', name: 'Monthly Newsletter', color: '#10b981', startDate: '2026-05-01', endDate: '2026-12-31', goal: 'Retain subscribers', segments: ['All Subscribers', 'Engaged Readers'] },
]

const defaultEmails: EmailCard[] = [
  { id: 'e1', subject: 'Summer Sale Starts Now — 40% Off Everything', sendDate: '2026-05-07T10:00', segment: ['All Subscribers', 'VIP Members'], campaignId: 'c1', emailType: 'Promo', status: 'Sent', owner: 'Alex', previewText: 'Our biggest sale of the year is here', notes: '', comments: [] },
  { id: 'e2', subject: 'Welcome to EmailCal — Getting Started', sendDate: '2026-05-08T09:00', segment: ['New Users'], campaignId: 'c2', emailType: 'Drip', status: 'Sent', owner: 'Jordan', previewText: 'Here is everything you need to know', notes: '', comments: [] },
  { id: 'e3', subject: "May Newsletter — What's New This Month", sendDate: '2026-05-12T08:00', segment: ['All Subscribers', 'Engaged Readers'], campaignId: 'c3', emailType: 'Newsletter', status: 'Approved', owner: 'Sam', previewText: 'Catch up on all the latest updates', notes: 'Make sure to include the product roundup', comments: [{ id: 'cmt1', author: 'Alex', text: 'Can we add the case study link?', timestamp: '2026-05-05T14:00' }] },
  { id: 'e4', subject: 'Last Chance — Summer Sale Ends Sunday', sendDate: '2026-05-16T11:00', segment: ['All Subscribers'], campaignId: 'c1', emailType: 'Promo', status: 'Scheduled', owner: 'Alex', previewText: "Don't miss out on 40% off", notes: '', comments: [] },
  { id: 'e5', subject: 'Pro Tips: Get More from EmailCal', sendDate: '2026-05-15T09:00', segment: ['New Users', 'Trial Users'], campaignId: 'c2', emailType: 'Drip', status: 'Review', owner: 'Jordan', previewText: 'Power user features you might have missed', notes: '', comments: [] },
  { id: 'e6', subject: 'Exclusive: Members-Only Flash Sale', sendDate: '2026-05-20T10:00', segment: ['VIP Members'], campaignId: 'c1', emailType: 'Promo', status: 'Draft', owner: 'Alex', previewText: '24-hour access for our best customers', notes: 'Needs design sign-off', comments: [] },
  { id: 'e7', subject: 'Your Monthly Digest — May Edition', sendDate: '2026-05-28T08:30', segment: ['All Subscribers', 'Engaged Readers'], campaignId: 'c3', emailType: 'Newsletter', status: 'Draft', owner: 'Sam', previewText: 'Everything that happened in May', notes: '', comments: [] },
]

type SegmentRow = {
  id: string
  name: string
}

type CampaignRow = {
  id: string
  name: string
  color: string
  start_date: string
  end_date: string
  goal: string
  segments: string[]
}

type EmailRow = {
  id: string
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

export function useStore() {
  const [state, setState] = useState<AppState>({
    segments: DEFAULT_SEGMENTS,
    campaigns: defaultCampaigns,
    emails: defaultEmails,
    selectedCampaignId: null,
    selectedSegment: null,
    view: 'month',
    currentDate: new Date('2026-05-01'),
  })
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(
    isSupabaseConfigured ? null : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect the app to your database.'
  )

  const loadData = useCallback(async () => {
    if (!supabase) return

    setIsLoading(true)
    setError(null)

    const [
      { data: segmentsData, error: segmentsError },
      { data: campaignsData, error: campaignsError },
      { data: emailsData, error: emailsError },
      { data: commentsData, error: commentsError },
    ] = await Promise.all([
      supabase.from('segments').select('id, name').order('name'),
      supabase.from('campaigns').select('id, name, color, start_date, end_date, goal, segments').order('created_at'),
      supabase.from('emails').select('id, subject, send_date, segment, campaign_id, email_type, status, owner, preview_text, notes').order('send_date'),
      supabase.from('comments').select('id, email_id, author, body, created_at').order('created_at'),
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
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const addEmail = useCallback(async (email: Omit<EmailCard, 'id' | 'comments'>) => {
    if (!supabase) return

    const { error: insertError } = await supabase.from('emails').insert({
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
  }, [loadData])

  const updateEmail = useCallback(async (id: string, updates: Partial<EmailCard>) => {
    if (!supabase) return

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

    const { error: updateError } = await supabase.from('emails').update(payload).eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await loadData()
  }, [loadData])

  const deleteEmail = useCallback(async (id: string) => {
    if (!supabase) return

    const { error: deleteError } = await supabase.from('emails').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadData()
  }, [loadData])

  const addCampaign = useCallback(async (campaign: Omit<Campaign, 'id' | 'color'>) => {
    if (!supabase) return

    const color = CAMPAIGN_COLORS[Math.floor(Math.random() * CAMPAIGN_COLORS.length)]
    const { error: insertError } = await supabase.from('campaigns').insert({
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
  }, [loadData])

  const renameCampaign = useCallback(async (id: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (!supabase) return

    const { error: updateError } = await supabase.from('campaigns').update({ name: trimmed }).eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await loadData()
  }, [loadData])

  const addSegment = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (!supabase) return

    const { error: insertError } = await supabase.from('segments').insert({ name: trimmed })

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadData()
  }, [loadData])

  const renameSegment = useCallback(async (oldName: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return
    if (!supabase) return

    const [segmentResult, campaignsResult, emailsResult] = await Promise.all([
      supabase.from('segments').update({ name: trimmed }).eq('name', oldName),
      supabase.rpc('rename_segment_in_campaigns', { old_name: oldName, new_name: trimmed }),
      supabase.rpc('rename_segment_in_emails', { old_name: oldName, new_name: trimmed }),
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
  }, [loadData])

  const addComment = useCallback(async (emailId: string, author: string, text: string) => {
    if (!supabase) return

    const { error: insertError } = await supabase.from('comments').insert({
      email_id: emailId,
      author,
      body: text,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadData()
  }, [loadData])

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

  return { state, isLoading, error, addEmail, updateEmail, deleteEmail, addCampaign, renameCampaign, addSegment, renameSegment, addComment, setView, setCurrentDate, setSelectedCampaign, setSelectedSegment, getConflicts, reload: loadData }
}
