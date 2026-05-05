import { useState, useMemo, useEffect } from 'react'
import { addMonths, subMonths } from 'date-fns'
import { useStore } from './store/useStore'
import { EmailCard } from './types'
import Sidebar from './components/Sidebar'
import MonthCalendar from './components/MonthCalendar'
import ListView from './components/ListView'
import PipelineView from './components/PipelineView'
import Analytics from './components/Analytics'
import EmailModal from './components/EmailModal'
import AddEmailModal from './components/AddEmailModal'
import AddCampaignModal from './components/AddCampaignModal'

type Modal = 'none' | 'addEmail' | 'addCampaign'

export default function App() {
  const { state, isLoading, error, addEmail, updateEmail, deleteEmail, addCampaign, renameCampaign, addSegment, renameSegment, addComment, setView, setCurrentDate, setSelectedCampaign, setSelectedSegment, getConflicts, reload } = useStore()
  const [selectedEmail, setSelectedEmail] = useState<EmailCard | null>(null)
  const [modal, setModal] = useState<Modal>('none')
  const [clickedDate, setClickedDate] = useState<Date | undefined>()
  const [newEmailCampaignId, setNewEmailCampaignId] = useState<string | undefined>()
  const [activeNav, setActiveNav] = useState('home')

  const handleNavChange = (id: string) => {
    setActiveNav(id)
    if (id === 'home') setView('month')
    if (id === 'pipeline') setView('pipeline')
  }

  const openAddEmail = (campaignId?: string, date?: Date) => {
    setNewEmailCampaignId(campaignId)
    setClickedDate(date)
    setModal('addEmail')
  }

  const { segments, campaigns, emails, selectedCampaignId, selectedSegment, currentDate } = state

  useEffect(() => {
    if (!selectedEmail) return
    const nextSelectedEmail = emails.find(email => email.id === selectedEmail.id) ?? null
    setSelectedEmail(nextSelectedEmail)
  }, [emails, selectedEmail])

  const filteredEmails = useMemo(() => {
    let result = emails
    if (selectedCampaignId) result = result.filter(e => e.campaignId === selectedCampaignId)
    if (selectedSegment) result = result.filter(e => e.segment.includes(selectedSegment))
    return result
  }, [emails, selectedCampaignId, selectedSegment])

  const conflictingEmails = emails.filter(e => getConflicts(e)).length

  const activeFilterLabel = selectedSegment
    ? `Segment: ${selectedSegment}`
    : selectedCampaignId
    ? `Campaign: ${campaigns.find(c => c.id === selectedCampaignId)?.name}`
    : null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        campaigns={campaigns}
        segments={segments}
        selectedCampaignId={selectedCampaignId}
        selectedSegment={selectedSegment}
        onSelectCampaign={setSelectedCampaign}
        onSelectSegment={setSelectedSegment}
        onAddSegment={addSegment}
        onRenameSegment={renameSegment}
        onRenameCampaign={renameCampaign}
        onAddEmailToCampaign={id => openAddEmail(id)}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onAddCampaign={() => setModal('addCampaign')}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            {activeNav === 'home' && (
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['month', 'list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${state.view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >{v}</button>
                ))}
              </div>
            )}
            {activeFilterLabel && (
              <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                <span>🔍</span>
                <span>{activeFilterLabel}</span>
                <button onClick={() => { setSelectedCampaign(null); setSelectedSegment(null) }} className="ml-1 text-blue-400 hover:text-blue-700">✕</button>
              </div>
            )}
            {conflictingEmails > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5">
                <span>⚠</span>
                <span>{conflictingEmails} send fatigue {conflictingEmails === 1 ? 'conflict' : 'conflicts'}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => openAddEmail(selectedCampaignId ?? undefined)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            New Email
          </button>
        </header>

        {(error || isLoading) && (
          <div className={`px-6 py-3 text-sm border-b shrink-0 ${error ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {isLoading
              ? 'Syncing with Supabase...'
              : error}
            {error && (
              <button onClick={() => void reload()} className="ml-3 text-blue-700 hover:text-blue-900 font-medium">
                Retry
              </button>
            )}
          </div>
        )}

        <main className="flex-1 overflow-hidden flex flex-col">
          {activeNav === 'analytics'
            ? <Analytics emails={emails} campaigns={campaigns} />
            : activeNav === 'pipeline' || state.view === 'pipeline'
            ? <PipelineView emails={filteredEmails} campaigns={campaigns} selectedCampaignId={selectedCampaignId} onEmailClick={setSelectedEmail} />
            : state.view === 'list'
            ? <ListView emails={filteredEmails} campaigns={campaigns} selectedCampaignId={selectedCampaignId} getConflicts={getConflicts} onEmailClick={setSelectedEmail} />
            : <MonthCalendar
                currentDate={currentDate}
                emails={filteredEmails}
                campaigns={campaigns}
                selectedCampaignId={selectedCampaignId}
                getConflicts={getConflicts}
                onEmailClick={setSelectedEmail}
                onDayClick={d => openAddEmail(selectedCampaignId ?? undefined, d)}
                onPrev={() => setCurrentDate(subMonths(currentDate, 1))}
                onNext={() => setCurrentDate(addMonths(currentDate, 1))}
                onToday={() => setCurrentDate(new Date())}
              />
          }
        </main>
      </div>

      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          campaigns={campaigns}
          segments={segments}
          hasConflict={getConflicts(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          onUpdate={(id, updates) => { void updateEmail(id, updates) }}
          onDelete={id => { void deleteEmail(id) }}
          onAddComment={(emailId, author, text) => { void addComment(emailId, author, text) }}
        />
      )}
      {modal === 'addEmail' && (
        <AddEmailModal
          campaigns={campaigns}
          segments={segments}
          defaultDate={clickedDate}
          defaultCampaignId={newEmailCampaignId}
          onAdd={addEmail}
          onClose={() => { setModal('none'); setNewEmailCampaignId(undefined) }}
        />
      )}
      {modal === 'addCampaign' && (
        <AddCampaignModal
          segments={segments}
          onAdd={addCampaign}
          onClose={() => setModal('none')}
        />
      )}
    </div>
  )
}
