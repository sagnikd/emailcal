import { format } from 'date-fns'
import { EmailCard, Campaign } from '../types'
import StatusBadge from './StatusBadge'

interface Props {
  emails: EmailCard[]
  campaigns: Campaign[]
  selectedCampaignId: string | null
  getConflicts: (e: EmailCard) => boolean
  onEmailClick: (e: EmailCard) => void
}

export default function ListView({ emails, campaigns, selectedCampaignId, getConflicts, onEmailClick }: Props) {
  const filtered = selectedCampaignId ? emails.filter(e => e.campaignId === selectedCampaignId) : emails
  const sorted = [...filtered].sort((a, b) => new Date(a.sendDate).getTime() - new Date(b.sendDate).getTime())

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white border-b border-slate-200 z-10">
          <tr>
            {['Subject', 'Campaign', 'Segment', 'Send Date', 'Type', 'Status', 'Owner'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map(email => {
            const campaign = campaigns.find(c => c.id === email.campaignId)
            return (
              <tr
                key={email.id}
                onClick={() => onEmailClick(email)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getConflicts(email) && <span title="Send fatigue warning" className="text-orange-500 shrink-0">⚠</span>}
                    <span className="font-medium text-slate-800 truncate max-w-xs">{email.subject}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: campaign?.color ?? '#94a3b8' }} />
                    <span className="text-slate-600">{campaign?.name ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {email.segment.map(s => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {format(new Date(email.sendDate), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-4 py-3 text-slate-600">{email.emailType}</td>
                <td className="px-4 py-3"><StatusBadge status={email.status} /></td>
                <td className="px-4 py-3 text-slate-600">{email.owner}</td>
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-400">No emails found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
