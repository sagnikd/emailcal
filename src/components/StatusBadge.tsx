import { EmailStatus } from '../types'

const CONFIG: Record<EmailStatus, { bg: string; text: string; dot: string; label: string }> = {
  Draft:     { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400',  label: 'Draft' },
  Review:    { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'In Review' },
  Approved:  { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Approved' },
  Scheduled: { bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-500', label: 'Scheduled' },
  Sent:      { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500',  label: 'Sent' },
  Paused:    { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400',    label: 'Paused' },
}

export default function StatusBadge({ status, size = 'sm' }: { status: EmailStatus; size?: 'xs' | 'sm' }) {
  const c = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${c.bg} ${c.text} ${size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
