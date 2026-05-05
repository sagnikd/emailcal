import { useState } from 'react'
import { format } from 'date-fns'
import { EmailCard, Campaign, EmailStatus, EmailType } from '../types'

const EMAIL_TYPES: EmailType[] = ['Newsletter', 'Promo', 'Drip', 'Transactional']

interface Props {
  campaigns: Campaign[]
  segments: string[]
  defaultDate?: Date
  defaultCampaignId?: string
  onAdd: (email: Omit<EmailCard, 'id' | 'comments'>) => void
  onClose: () => void
}

export default function AddEmailModal({ campaigns, segments, defaultDate, defaultCampaignId, onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    subject: '',
    sendDate: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'10:00") : format(new Date(), "yyyy-MM-dd'T'10:00"),
    segment: [] as string[],
    campaignId: defaultCampaignId ?? campaigns[0]?.id ?? '',
    emailType: 'Newsletter' as EmailType,
    status: 'Draft' as EmailStatus,
    owner: 'Alex',
    previewText: '',
    notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const toggleSegment = (seg: string) =>
    setForm(f => ({
      ...f,
      segment: f.segment.includes(seg) ? f.segment.filter(s => s !== seg) : [...f.segment, seg],
    }))

  const valid = form.subject.trim() && form.sendDate && form.campaignId && form.segment.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-slate-800">New Email</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors flex items-center justify-center">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Subject Line *</label>
            <input
              autoFocus
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400"
              placeholder="e.g. Summer Sale — 40% Off Everything"
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Send Date *</label>
              <input
                type="datetime-local"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400"
                value={form.sendDate}
                onChange={e => set('sendDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Campaign *</label>
              <select
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 bg-white"
                value={form.campaignId}
                onChange={e => set('campaignId', e.target.value)}
              >
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Segment multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Segments *</label>
              {form.segment.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">{form.segment.length} selected</span>
              )}
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-44 overflow-y-auto">
              {segments.map(seg => {
                const checked = form.segment.includes(seg)
                return (
                  <label
                    key={seg}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors select-none ${checked ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                      {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}
                    </div>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleSegment(seg)} />
                    <span className={`text-sm ${checked ? 'text-blue-800 font-medium' : 'text-slate-700'}`}>{seg}</span>
                  </label>
                )
              })}
            </div>
            {form.segment.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.segment.map(seg => (
                  <span key={seg} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-2.5 py-0.5">
                    {seg}
                    <button onClick={() => toggleSegment(seg)} className="text-blue-400 hover:text-blue-800">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Email Type</label>
              <select
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 bg-white"
                value={form.emailType}
                onChange={e => set('emailType', e.target.value as EmailType)}
              >
                {EMAIL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Owner</label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400"
                value={form.owner}
                onChange={e => set('owner', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Status</label>
              <select
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 bg-white"
                value={form.status}
                onChange={e => set('status', e.target.value as EmailStatus)}
              >
                {(['Draft', 'Review', 'Approved', 'Scheduled'] as EmailStatus[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Notes</label>
            <textarea
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 resize-none"
              placeholder="Brief, context, links..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={() => { if (valid) { onAdd(form); onClose() } }}
            disabled={!valid}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >Add Email</button>
        </div>
      </div>
    </div>
  )
}
