import { useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay
} from 'date-fns'
import { EmailCard, Campaign } from '../types'
import EmailChip from './EmailChip'

interface Props {
  currentDate: Date
  emails: EmailCard[]
  campaigns: Campaign[]
  selectedCampaignId: string | null
  getConflicts: (e: EmailCard) => boolean
  onEmailClick: (email: EmailCard) => void
  onDayClick: (date: Date) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthCalendar({ currentDate, emails, campaigns, selectedCampaignId, getConflicts, onEmailClick, onDayClick, onPrev, onNext, onToday }: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const filtered = useMemo(() =>
    selectedCampaignId ? emails.filter(e => e.campaignId === selectedCampaignId) : emails
  , [emails, selectedCampaignId])

  const emailsForDay = (day: Date) =>
    filtered.filter(e => isSameDay(new Date(e.sendDate), day))
      .sort((a, b) => new Date(a.sendDate).getTime() - new Date(b.sendDate).getTime())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={onToday} className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Today</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">‹</button>
          <button onClick={onNext} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">›</button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-slate-100" style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(0, 1fr))` }}>
        {days.map((day, i) => {
          const dayEmails = emailsForDay(day)
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          return (
            <div
              key={i}
              className={`border-b border-slate-100 p-1.5 flex flex-col cursor-pointer transition-colors group ${inMonth ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/60'}`}
              onClick={() => onDayClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${today ? 'bg-blue-600 text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                {dayEmails.length > 0 && (
                  <span className="text-xs text-slate-400 group-hover:text-blue-500">{dayEmails.length}</span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden flex-1">
                {dayEmails.slice(0, 3).map(email => (
                  <EmailChip
                    key={email.id}
                    email={email}
                    campaign={campaigns.find(c => c.id === email.campaignId)}
                    hasConflict={getConflicts(email)}
                    onClick={e => { e.stopPropagation(); onEmailClick(email) }}
                  />
                ))}
                {dayEmails.length > 3 && (
                  <div className="text-xs text-slate-400 px-1">+{dayEmails.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
