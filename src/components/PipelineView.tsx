import { EmailCard, Campaign, EmailStatus } from '../types'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'

const STAGES: EmailStatus[] = ['Draft', 'Review', 'Approved', 'Scheduled', 'Sent', 'Paused']

const STAGE_COLORS: Record<EmailStatus, string> = {
  Draft: 'border-slate-200',
  Review: 'border-amber-200',
  Approved: 'border-blue-200',
  Scheduled: 'border-purple-200',
  Sent: 'border-green-200',
  Paused: 'border-red-200',
}

interface Props {
  emails: EmailCard[]
  campaigns: Campaign[]
  selectedCampaignId: string | null
  onEmailClick: (e: EmailCard) => void
}

export default function PipelineView({ emails, campaigns, selectedCampaignId, onEmailClick }: Props) {
  const filtered = selectedCampaignId ? emails.filter(e => e.campaignId === selectedCampaignId) : emails

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <div className="flex gap-3 h-full min-h-[500px]" style={{ minWidth: `${STAGES.length * 220}px` }}>
        {STAGES.map(stage => {
          const stageEmails = filtered.filter(e => e.status === stage)
          return (
            <div key={stage} className={`flex flex-col rounded-xl border-2 ${STAGE_COLORS[stage]} bg-white w-52 shrink-0`}>
              <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <StatusBadge status={stage} />
                <span className="text-xs text-slate-400 font-medium">{stageEmails.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageEmails.map(email => {
                  const campaign = campaigns.find(c => c.id === email.campaignId)
                  return (
                    <button
                      key={email.id}
                      onClick={() => onEmailClick(email)}
                      className="w-full text-left bg-white border border-slate-200 rounded-lg p-2.5 hover:shadow-sm hover:border-slate-300 transition-all group"
                    >
                      <div className="flex items-start gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: campaign?.color ?? '#94a3b8' }} />
                        <span className="text-xs font-medium text-slate-800 leading-tight line-clamp-2">{email.subject}</span>
                      </div>
                      <div className="text-xs text-slate-400">{format(new Date(email.sendDate), 'MMM d, HH:mm')}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{email.owner}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
