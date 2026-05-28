import { useRef, useState } from 'react'
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

const STAGE_DROP_COLORS: Record<EmailStatus, string> = {
  Draft: 'bg-slate-50',
  Review: 'bg-amber-50',
  Approved: 'bg-blue-50',
  Scheduled: 'bg-purple-50',
  Sent: 'bg-green-50',
  Paused: 'bg-red-50',
}

interface Props {
  emails: EmailCard[]
  campaigns: Campaign[]
  selectedCampaignId: string | null
  onEmailClick: (e: EmailCard) => void
  onUpdateStatus: (id: string, status: EmailStatus) => void
}

export default function PipelineView({ emails, campaigns, selectedCampaignId, onEmailClick, onUpdateStatus }: Props) {
  const filtered = selectedCampaignId ? emails.filter(e => e.campaignId === selectedCampaignId) : emails
  const dragId = useRef<string | null>(null)
  const [overStage, setOverStage] = useState<EmailStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, stage: EmailStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverStage(stage)
  }

  const handleDrop = (e: React.DragEvent, stage: EmailStatus) => {
    e.preventDefault()
    setOverStage(null)
    if (!dragId.current) return
    const email = emails.find(em => em.id === dragId.current)
    if (email && email.status !== stage) {
      onUpdateStatus(email.id, stage)
    }
    dragId.current = null
  }

  const handleDragLeave = () => setOverStage(null)
  const handleDragEnd = () => { dragId.current = null; setOverStage(null) }

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <div className="flex gap-3 h-full min-h-[500px]" style={{ minWidth: `${STAGES.length * 220}px` }}>
        {STAGES.map(stage => {
          const stageEmails = filtered.filter(e => e.status === stage)
          const isOver = overStage === stage
          return (
            <div
              key={stage}
              className={`flex flex-col rounded-xl border-2 ${STAGE_COLORS[stage]} ${isOver ? STAGE_DROP_COLORS[stage] : 'bg-white'} w-52 shrink-0 transition-colors`}
              onDragOver={e => handleDragOver(e, stage)}
              onDrop={e => handleDrop(e, stage)}
              onDragLeave={handleDragLeave}
            >
              <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <StatusBadge status={stage} />
                <span className="text-xs text-slate-400 font-medium">{stageEmails.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageEmails.map(email => {
                  const campaign = campaigns.find(c => c.id === email.campaignId)
                  return (
                    <div
                      key={email.id}
                      draggable
                      onDragStart={e => handleDragStart(e, email.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onEmailClick(email)}
                      className="w-full text-left bg-white border border-slate-200 rounded-lg p-2.5 hover:shadow-sm hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing active:opacity-50 active:shadow-md"
                    >
                      <div className="flex items-start gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: campaign?.color ?? '#94a3b8' }} />
                        <span className="text-xs font-medium text-slate-800 leading-tight line-clamp-2">{email.subject}</span>
                      </div>
                      <div className="text-xs text-slate-400">{format(new Date(email.sendDate), 'MMM d, HH:mm')}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{email.owner}</div>
                    </div>
                  )
                })}
                {isOver && (
                  <div className="h-10 rounded-lg border-2 border-dashed border-slate-300 opacity-60" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
