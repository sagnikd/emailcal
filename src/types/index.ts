export type EmailStatus = 'Draft' | 'Review' | 'Approved' | 'Scheduled' | 'Sent' | 'Paused'
export type EmailType = 'Newsletter' | 'Promo' | 'Drip' | 'Transactional'
export type ViewMode = 'month' | 'week' | 'list' | 'pipeline'

export interface Team {
  id: string
  name: string
  slug: string
  memberCount: number
}

export interface Profile {
  userId: string
  email: string
  fullName: string
  isSuperadmin: boolean
  currentTeamId: string | null
}

export interface JoinRequest {
  id: string
  team_id: string
  team_name: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at: string | null
}

export interface PendingRequest {
  id: string
  team_id: string
  team_name: string
  user_id: string
  user_email: string
  user_full_name: string
  requested_at: string
}

export interface Campaign {
  id: string
  name: string
  color: string
  startDate: string
  endDate: string
  goal: string
  segments: string[]
}

export interface EmailCard {
  id: string
  subject: string
  sendDate: string
  segment: string[]
  campaignId: string
  emailType: EmailType
  status: EmailStatus
  owner: string
  previewText: string
  notes: string
  comments: Comment[]
}

export interface Comment {
  id: string
  author: string
  text: string
  timestamp: string
}

export interface AppState {
  segments: string[]
  campaigns: Campaign[]
  emails: EmailCard[]
  selectedCampaignId: string | null
  selectedSegment: string | null
  view: ViewMode
  currentDate: Date
}
