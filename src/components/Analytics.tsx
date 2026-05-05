import { EmailCard, Campaign } from '../types'

interface Props {
  emails: EmailCard[]
  campaigns: Campaign[]
}

const METRICS = [
  { label: 'Total Emails', key: 'total', color: 'bg-blue-500' },
  { label: 'Sent', key: 'sent', color: 'bg-green-500' },
  { label: 'Scheduled', key: 'scheduled', color: 'bg-purple-500' },
  { label: 'In Review', key: 'review', color: 'bg-amber-500' },
]

export default function Analytics({ emails, campaigns }: Props) {
  const stats = {
    total: emails.length,
    sent: emails.filter(e => e.status === 'Sent').length,
    scheduled: emails.filter(e => e.status === 'Scheduled').length,
    review: emails.filter(e => e.status === 'Review').length,
  }

  const byType = ['Newsletter', 'Promo', 'Drip', 'Transactional'].map(type => ({
    type,
    count: emails.filter(e => e.emailType === type).length,
  }))

  const byCampaign = campaigns.map(c => ({
    campaign: c,
    count: emails.filter(e => e.campaignId === c.id).length,
    sent: emails.filter(e => e.campaignId === c.id && e.status === 'Sent').length,
  }))

  const max = Math.max(...byCampaign.map(b => b.count), 1)

  return (
    <div className="flex-1 overflow-auto p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">Performance Dashboard</h2>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {METRICS.map(m => (
          <div key={m.key} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-1 rounded-full ${m.color} mb-3`} />
            <div className="text-2xl font-bold text-slate-800">{stats[m.key as keyof typeof stats]}</div>
            <div className="text-sm text-slate-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* By Campaign */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Emails by Campaign</h3>
          <div className="space-y-3">
            {byCampaign.map(({ campaign, count, sent }) => (
              <div key={campaign.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: campaign.color }} />
                    <span className="text-sm text-slate-700">{campaign.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{sent}/{count} sent</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / max) * 100}%`, backgroundColor: campaign.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Emails by Type</h3>
          <div className="space-y-3">
            {byType.map(({ type, count }) => {
              const pct = Math.round((count / (emails.length || 1)) * 100)
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{type}</span>
                    <span className="text-xs text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Breakdown</h3>
          <div className="flex items-end gap-3 h-24">
            {(['Draft', 'Review', 'Approved', 'Scheduled', 'Sent', 'Paused'] as const).map(s => {
              const count = emails.filter(e => e.status === s).length
              const pct = Math.round((count / (emails.length || 1)) * 100)
              const colors: Record<string, string> = { Draft: '#94a3b8', Review: '#f59e0b', Approved: '#3b82f6', Scheduled: '#8b5cf6', Sent: '#10b981', Paused: '#ef4444' }
              return (
                <div key={s} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-slate-500">{count}</span>
                  <div className="w-full rounded-t-sm" style={{ height: `${Math.max(pct * 0.8, 4)}px`, backgroundColor: colors[s] }} />
                  <span className="text-xs text-slate-500 truncate w-full text-center">{s}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
