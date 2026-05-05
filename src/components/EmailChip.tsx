import React from 'react'
import { EmailCard, Campaign } from '../types'

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-200 text-slate-700',
  Review: 'bg-amber-100 text-amber-800',
  Approved: 'bg-blue-100 text-blue-800',
  Scheduled: 'bg-purple-100 text-purple-800',
  Sent: 'bg-green-100 text-green-800',
  Paused: 'bg-red-100 text-red-700',
}

interface Props {
  email: EmailCard
  campaign?: Campaign
  hasConflict: boolean
  onClick: (e: React.MouseEvent) => void
}

export default function EmailChip({ email, campaign, hasConflict, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group"
    >
      <div
        className={`rounded-md px-2 py-1 text-xs font-medium leading-tight mb-0.5 border-l-2 transition-all hover:shadow-sm ${STATUS_COLORS[email.status]}`}
        style={{ borderLeftColor: campaign?.color ?? '#94a3b8' }}
      >
        <div className="flex items-start gap-1">
          <span className="truncate flex-1">{email.subject}</span>
          {hasConflict && <span title="Send fatigue warning" className="shrink-0 text-orange-500">⚠</span>}
        </div>
      </div>
    </button>
  )
}
