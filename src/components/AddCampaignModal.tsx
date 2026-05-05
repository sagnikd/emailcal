import { useState } from 'react'
import { Campaign } from '../types'
import { format } from 'date-fns'

interface Props {
  segments: string[]
  onAdd: (c: Omit<Campaign, 'id' | 'color'>) => void
  onClose: () => void
}

export default function AddCampaignModal({ segments, onAdd, onClose }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({
    name: '',
    startDate: today,
    endDate: today,
    goal: '',
    segments: [] as string[],
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name.trim()

  const toggleSegment = (seg: string) => {
    setForm(f => ({
      ...f,
      segments: f.segments.includes(seg)
        ? f.segments.filter(s => s !== seg)
        : [...f.segments, seg],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-slate-800">New Campaign</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors flex items-center justify-center">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Campaign Name *</label>
            <input
              autoFocus
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400"
              placeholder="e.g. Black Friday 2026"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Start Date</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">End Date</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Goal</label>
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400"
              placeholder="e.g. Drive Q3 revenue"
              value={form.goal}
              onChange={e => set('goal', e.target.value)}
            />
          </div>

          {/* Segment multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Segments</label>
              {form.segments.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">{form.segments.length} selected</span>
              )}
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {segments.map(seg => {
                const checked = form.segments.includes(seg)
                return (
                  <label
                    key={seg}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none ${
                      checked ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                    }`}>
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
            {form.segments.length === 0 && (
              <p className="text-xs text-slate-400 mt-1.5 px-1">No segments selected — you can add them later</p>
            )}
          </div>

          {/* Selected tags summary */}
          {form.segments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.segments.map(seg => (
                <span
                  key={seg}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-2.5 py-1"
                >
                  {seg}
                  <button
                    onClick={() => toggleSegment(seg)}
                    className="text-blue-500 hover:text-blue-800 leading-none"
                  >✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={() => { if (valid) { onAdd(form); onClose() } }}
            disabled={!valid}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >Create Campaign</button>
        </div>
      </div>
    </div>
  )
}
