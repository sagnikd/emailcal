import { useState } from 'react'
import { format } from 'date-fns'
import { EmailCard, Campaign, EmailStatus, EmailType } from '../types'
import StatusBadge from './StatusBadge'

const STATUSES: EmailStatus[] = ['Draft', 'Review', 'Approved', 'Scheduled', 'Sent', 'Paused']
const EMAIL_TYPES: EmailType[] = ['Newsletter', 'Promo', 'Drip', 'Transactional']
const PIPELINE: EmailStatus[] = ['Draft', 'Review', 'Approved', 'Scheduled', 'Sent']

interface Props {
  email: EmailCard
  campaigns: Campaign[]
  segments: string[]
  hasConflict: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<EmailCard>) => void
  onDelete: (id: string) => void
  onAddComment: (emailId: string, author: string, text: string) => void
}

export default function EmailModal({ email, campaigns, segments, hasConflict, onClose, onUpdate, onDelete, onAddComment }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(email)
  const [comment, setComment] = useState('')
  const [tab, setTab] = useState<'details' | 'comments'>('details')

  const campaign = campaigns.find(c => c.id === email.campaignId)
  const pipelineIdx = PIPELINE.indexOf(email.status)

  const save = () => { onUpdate(email.id, draft); setEditing(false) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {campaign && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: campaign.color }} />}
            <span className="text-sm font-medium text-slate-500">{campaign?.name ?? 'No Campaign'}</span>
            <span className="text-slate-300">·</span>
            <StatusBadge status={email.status} />
            {hasConflict && (
              <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                ⚠ Send fatigue warning
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editing
              ? <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Edit</button>
              : <>
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button onClick={save} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Save</button>
                </>
            }
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors flex items-center justify-center">✕</button>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1">
            {PIPELINE.map((stage, i) => (
              <div key={stage} className="flex items-center gap-1 flex-1">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${i <= pipelineIdx ? 'bg-blue-500' : 'bg-slate-200'}`}
                />
                {i === PIPELINE.length - 1 && null}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {PIPELINE.map((stage, i) => (
              <span key={stage} className={`text-xs ${i <= pipelineIdx ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                {stage}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-5">
            {/* Subject */}
            {editing
              ? <input
                  className="w-full text-xl font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-blue-400"
                  value={draft.subject}
                  onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))}
                />
              : <h2 className="text-xl font-semibold text-slate-800 mb-4">{email.subject}</h2>
            }

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: 'Send Date', field: 'sendDate', type: 'datetime-local' },
                { label: 'Owner', field: 'owner', type: 'text' },
                { label: 'Preview Text', field: 'previewText', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</div>
                  {editing
                    ? <input
                        type={type}
                        className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
                        value={draft[field as keyof typeof draft] as string}
                        onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))}
                      />
                    : <div className="text-sm text-slate-700">
                        {field === 'sendDate'
                          ? format(new Date(email.sendDate), 'MMM d, yyyy · HH:mm')
                          : (email[field as keyof EmailCard] as string) || <span className="text-slate-300">—</span>
                        }
                      </div>
                  }
                </div>
              ))}

              {/* Segment — multi-select, spans full width */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Segments</div>
                  {editing && draft.segment.length > 0 && (
                    <span className="text-xs text-blue-600 font-medium">{draft.segment.length} selected</span>
                  )}
                </div>
                {editing ? (
                  <>
                    <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-36 overflow-y-auto">
                      {segments.map(seg => {
                        const checked = draft.segment.includes(seg)
                        return (
                          <label
                            key={seg}
                            className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer select-none transition-colors ${checked ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                              {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>}
                            </div>
                            <input type="checkbox" className="sr-only" checked={checked}
                              onChange={() => setDraft(d => ({
                                ...d,
                                segment: checked ? d.segment.filter(s => s !== seg) : [...d.segment, seg]
                              }))}
                            />
                            <span className={`text-sm ${checked ? 'text-blue-800 font-medium' : 'text-slate-700'}`}>{seg}</span>
                          </label>
                        )
                      })}
                    </div>
                    {draft.segment.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {draft.segment.map(seg => (
                          <span key={seg} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-2.5 py-0.5">
                            {seg}
                            <button
                              onClick={() => setDraft(d => ({ ...d, segment: d.segment.filter(s => s !== seg) }))}
                              className="text-blue-400 hover:text-blue-800"
                            >✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {email.segment.length > 0
                      ? email.segment.map(seg => (
                          <span key={seg} className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium rounded-full px-2.5 py-1">{seg}</span>
                        ))
                      : <span className="text-sm text-slate-300">—</span>
                    }
                  </div>
                )}
              </div>

              {/* Email Type */}
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email Type</div>
                {editing
                  ? <select
                      className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
                      value={draft.emailType}
                      onChange={e => setDraft(d => ({ ...d, emailType: e.target.value as EmailType }))}
                    >
                      {EMAIL_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  : <div className="text-sm text-slate-700">{email.emailType}</div>
                }
              </div>

              {/* Status */}
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Status</div>
                {editing
                  ? <select
                      className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
                      value={draft.status}
                      onChange={e => setDraft(d => ({ ...d, status: e.target.value as EmailStatus }))}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  : <StatusBadge status={email.status} />
                }
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Notes</div>
              {editing
                ? <textarea
                    rows={3}
                    className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none"
                    value={draft.notes}
                    onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                  />
                : <div className="text-sm text-slate-700 whitespace-pre-wrap min-h-[3rem] bg-slate-50 rounded-lg px-3 py-2">
                    {email.notes || <span className="text-slate-300">No notes</span>}
                  </div>
              }
            </div>

            {/* Comments */}
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                Comments <span className="bg-slate-100 text-slate-500 rounded-full px-1.5 text-xs">{email.comments.length}</span>
              </div>
              <div className="space-y-3 mb-3">
                {email.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">{c.author[0]}</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                        <span className="text-xs text-slate-400">{format(new Date(c.timestamp), 'MMM d, HH:mm')}</span>
                      </div>
                      <div className="text-sm text-slate-600 mt-0.5">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && comment.trim()) {
                      onAddComment(email.id, 'Alex', comment.trim())
                      setComment('')
                    }
                  }}
                />
                <button
                  onClick={() => { if (comment.trim()) { onAddComment(email.id, 'Alex', comment.trim()); setComment('') } }}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >Send</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => { if (confirm('Delete this email?')) { onDelete(email.id); onClose() } }}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >Delete email</button>
          {email.status !== 'Sent' && (
            <button
              onClick={() => {
                const next = PIPELINE[PIPELINE.indexOf(email.status) + 1]
                if (next) onUpdate(email.id, { status: next })
              }}
              disabled={pipelineIdx === PIPELINE.length - 1}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Move to {PIPELINE[pipelineIdx + 1] ?? 'Sent'} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
