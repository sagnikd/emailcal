import { useState, useRef } from 'react'
import { Campaign, EmailCard } from '../types'

const NAV = [
  { id: 'home', label: 'Calendar', icon: '📅' },
  { id: 'pipeline', label: 'Pipeline', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

interface Props {
  campaigns: Campaign[]
  emails: EmailCard[]
  segments: string[]
  currentUserName: string
  currentUserLabel: string
  selectedCampaignId: string | null
  selectedSegment: string | null
  onSelectCampaign: (id: string | null) => void
  onSelectSegment: (seg: string | null) => void
  onAddSegment: (name: string) => void
  onRenameSegment: (oldName: string, newName: string) => void
  onRenameCampaign: (id: string, newName: string) => void
  onAddEmailToCampaign: (campaignId: string) => void
  activeNav: string
  onNavChange: (id: string) => void
  onAddCampaign: () => void
  pendingRequestCount?: number
}

function PencilIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5l2 2L4 10H2v-2l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Sidebar({
  campaigns, emails, segments, currentUserName, currentUserLabel, selectedCampaignId, selectedSegment,
  onSelectCampaign, onSelectSegment, onAddSegment, onRenameSegment, onRenameCampaign, onAddEmailToCampaign,
  activeNav, onNavChange, onAddCampaign, pendingRequestCount = 0,
}: Props) {
  const [addingSegment, setAddingSegment] = useState(false)
  const [newSegment, setNewSegment] = useState('')
  const [editingSegment, setEditingSegment] = useState<string | null>(null)
  const [editSegmentValue, setEditSegmentValue] = useState('')
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [editCampaignValue, setEditCampaignValue] = useState('')

  const addSegInputRef = useRef<HTMLInputElement>(null)
  const editSegInputRef = useRef<HTMLInputElement>(null)
  const editCampaignInputRef = useRef<HTMLInputElement>(null)
  const userInitial = currentUserName.trim().charAt(0).toUpperCase() || 'U'

  const getCampaignSegmentCount = (campaignId: string, fallbackSegments: string[]) => {
    const uniqueSegments = new Set(
      emails
        .filter(email => email.campaignId === campaignId)
        .flatMap(email => email.segment)
    )

    return uniqueSegments.size > 0 ? uniqueSegments.size : fallbackSegments.length
  }

  /* ── Segment helpers ── */
  const commitNewSeg = () => {
    if (newSegment.trim()) onAddSegment(newSegment.trim())
    setNewSegment(''); setAddingSegment(false)
  }
  const startEditSeg = (seg: string) => {
    setEditingSegment(seg); setEditSegmentValue(seg)
    setTimeout(() => { editSegInputRef.current?.focus(); editSegInputRef.current?.select() }, 30)
  }
  const commitEditSeg = () => {
    if (editingSegment) onRenameSegment(editingSegment, editSegmentValue)
    setEditingSegment(null); setEditSegmentValue('')
  }

  /* ── Campaign helpers ── */
  const startEditCampaign = (c: Campaign) => {
    setEditingCampaignId(c.id); setEditCampaignValue(c.name)
    setTimeout(() => { editCampaignInputRef.current?.focus(); editCampaignInputRef.current?.select() }, 30)
  }
  const commitEditCampaign = () => {
    if (editingCampaignId) onRenameCampaign(editingCampaignId, editCampaignValue)
    setEditingCampaignId(null); setEditCampaignValue('')
  }

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto scrollbar-hide">
      {/* Logo */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">EC</div>
          <span className="font-semibold text-slate-800 text-sm">EmailsCal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-0.5 shrink-0">
        {NAV.map(n => (
          <button key={n.id} onClick={() => onNavChange(n.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
              activeNav === n.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span>{n.icon}</span>
            <span className="flex-1">{n.label}</span>
            {n.id === 'settings' && pendingRequestCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                {pendingRequestCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Campaigns */}
      <div className="px-3 pt-2 pb-1 shrink-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Campaigns</span>
          <button onClick={onAddCampaign}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-base leading-none"
            title="New campaign"
          >+</button>
        </div>

        <div className="space-y-0.5">
          {/* All */}
          <button
            onClick={() => { onSelectCampaign(null); onSelectSegment(null) }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              selectedCampaignId === null && selectedSegment === null ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
            All
          </button>

          {campaigns.map(c => (
            <div key={c.id} className="group relative">
              {editingCampaignId === c.id ? (
                /* Inline campaign rename */
                <div className="flex items-center gap-1 px-1">
                  <input
                    ref={editCampaignInputRef}
                    className="flex-1 text-sm border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none min-w-0 bg-white"
                    value={editCampaignValue}
                    onChange={e => setEditCampaignValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEditCampaign()
                      if (e.key === 'Escape') { setEditingCampaignId(null) }
                    }}
                    onBlur={commitEditCampaign}
                  />
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    selectedCampaignId === c.id ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => { onSelectCampaign(c.id); onSelectSegment(null) }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const segmentCount = getCampaignSegmentCount(c.id, c.segments)
                      return (
                        <>
                    <div className="truncate">{c.name}</div>
                          {segmentCount > 0 && (
                            <div className="text-xs text-slate-400 truncate">{segmentCount} segment{segmentCount !== 1 ? 's' : ''}</div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                  {/* Action icons — visible on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                    {/* Add email to campaign */}
                    <button
                      className="text-slate-400 hover:text-blue-600 p-0.5 rounded"
                      title="Add email to campaign"
                      onClick={e => { e.stopPropagation(); onAddEmailToCampaign(c.id) }}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    {/* Rename campaign */}
                    <button
                      className="text-slate-400 hover:text-blue-600 p-0.5 rounded"
                      title="Rename campaign"
                      onClick={e => { e.stopPropagation(); startEditCampaign(c) }}
                    >
                      <PencilIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 border-t border-slate-100 my-2 shrink-0" />

      {/* Segments */}
      <div className="px-3 pb-3 flex-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Segments</span>
          <button
            onClick={() => { setAddingSegment(true); setTimeout(() => addSegInputRef.current?.focus(), 50) }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-base leading-none"
            title="New segment"
          >+</button>
        </div>

        <div className="space-y-0.5">
          {segments.map(seg => (
            <div key={seg} className="group relative">
              {editingSegment === seg ? (
                <div className="flex items-center gap-1 px-1">
                  <input
                    ref={editSegInputRef}
                    className="flex-1 text-sm border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none min-w-0 bg-white"
                    value={editSegmentValue}
                    onChange={e => setEditSegmentValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEditSeg()
                      if (e.key === 'Escape') { setEditingSegment(null) }
                    }}
                    onBlur={commitEditSeg}
                  />
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    selectedSegment === seg ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => { onSelectSegment(selectedSegment === seg ? null : seg); onSelectCampaign(null) }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${selectedSegment === seg ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <span className="truncate flex-1">{seg}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 shrink-0 p-0.5 rounded"
                    title="Rename segment"
                    onClick={e => { e.stopPropagation(); startEditSeg(seg) }}
                  >
                    <PencilIcon />
                  </button>
                </div>
              )}
            </div>
          ))}

          {addingSegment && (
            <div className="flex items-center gap-1 px-1 pt-1">
              <input
                ref={addSegInputRef}
                className="flex-1 text-sm border border-blue-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 min-w-0"
                placeholder="Segment name…"
                value={newSegment}
                onChange={e => setNewSegment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitNewSeg()
                  if (e.key === 'Escape') { setAddingSegment(false); setNewSegment('') }
                }}
                onBlur={commitNewSeg}
              />
            </div>
          )}
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">{userInitial}</div>
          <div className="text-sm">
            <div className="font-medium text-slate-700 truncate">{currentUserName}</div>
            <div className="text-xs text-slate-400 truncate">{currentUserLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
