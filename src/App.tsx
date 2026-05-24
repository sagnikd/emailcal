import { useState, useMemo, useEffect, useRef } from 'react'
import { addMonths, subMonths } from 'date-fns'
import { useStore } from './store/useStore'
import { useAuth } from './store/useAuth'
import { EmailCard } from './types'
import Sidebar from './components/Sidebar'
import MonthCalendar from './components/MonthCalendar'
import ListView from './components/ListView'
import PipelineView from './components/PipelineView'
import Analytics from './components/Analytics'
import EmailModal from './components/EmailModal'
import AddEmailModal from './components/AddEmailModal'
import AddCampaignModal from './components/AddCampaignModal'
import AuthScreen from './components/AuthScreen'
import TeamDirectory from './components/TeamDirectory'
import JoinTeamScreen from './components/JoinTeamScreen'

type Modal = 'none' | 'addEmail' | 'addCampaign'

export default function App() {
  const auth = useAuth()
  const {
    session,
    profile,
    teams,
    allTeams,
    activeTeamId,
    isLoading: authLoading,
    error: authError,
    info,
    orgCount,
    myJoinRequests,
    pendingRequests,
    signIn,
    signUp,
    signOut,
    switchTeam,
    createTeam,
    requestJoinTeam,
    approveRequest,
    rejectRequest,
    leaveCurrentTeam,
  } = auth

  const {
    state,
    isLoading,
    error,
    addEmail,
    updateEmail,
    deleteEmail,
    addCampaign,
    renameCampaign,
    addSegment,
    renameSegment,
    addComment,
    setView,
    setCurrentDate,
    setSelectedCampaign,
    setSelectedSegment,
    getConflicts,
    reload,
  } = useStore(activeTeamId, profile?.fullName ?? '')

  const [selectedEmail, setSelectedEmail] = useState<EmailCard | null>(null)
  const [modal, setModal] = useState<Modal>('none')
  const [clickedDate, setClickedDate] = useState<Date | undefined>()
  const [newEmailCampaignId, setNewEmailCampaignId] = useState<string | undefined>()
  const [activeNav, setActiveNav] = useState('home')
  const pendingUrlTeamSlug = useRef<string | null>(null)

  const activeTeam = teams.find(team => team.id === activeTeamId) ?? null

  const getTeamSlugFromPath = () => {
    const match = window.location.pathname.match(/^\/team\/([^/]+)$/)
    return match ? decodeURIComponent(match[1]) : null
  }

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

  useEffect(() => {
    pendingUrlTeamSlug.current = getTeamSlugFromPath()
    const onPopState = () => {
      pendingUrlTeamSlug.current = getTeamSlugFromPath()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!pendingUrlTeamSlug.current || teams.length === 0) return
    const teamFromUrl = teams.find(team => team.slug === pendingUrlTeamSlug.current)
    if (!teamFromUrl || teamFromUrl.id === activeTeamId) {
      pendingUrlTeamSlug.current = null
      return
    }
    void switchTeam(teamFromUrl.id)
    pendingUrlTeamSlug.current = null
  }, [activeTeamId, switchTeam, teams])

  useEffect(() => {
    if (!activeTeam?.slug) return
    const targetPath = `/team/${encodeURIComponent(activeTeam.slug)}`
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({}, '', targetPath)
    }
  }, [activeTeam?.slug])

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

  if (!session || !profile) {
    return (
      <AuthScreen
        onSignIn={(email, password) => { void signIn(email, password) }}
        onSignUp={(email, password, fullName) => { void signUp(email, password, fullName) }}
        error={authError}
        info={info}
        isLoading={authLoading}
      />
    )
  }

  // New user: not part of any team yet → show join screen
  if (!authLoading && teams.length === 0 && !profile.isSuperadmin) {
    return (
      <JoinTeamScreen
        allTeams={allTeams}
        myJoinRequests={myJoinRequests}
        onRequestJoin={teamId => { void requestJoinTeam(teamId) }}
        onSignOut={() => { void signOut() }}
      />
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        campaigns={campaigns}
        emails={emails}
        segments={segments}
        currentUserName={profile.fullName}
        currentUserLabel={profile.isSuperadmin ? 'Superadmin' : activeTeam?.name ?? 'Workspace member'}
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
        pendingRequestCount={pendingRequests.length}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            {activeNav === 'home' && (
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['month', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${state.view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {v}
                  </button>
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

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-slate-800">{profile.fullName}</div>
                <div className="text-xs text-slate-500">
                  {profile.isSuperadmin ? 'Superadmin' : activeTeam?.name ?? 'No workspace selected'}
                </div>
              </div>
              {teams.length > 0 && (
                <select
                  value={activeTeamId ?? ''}
                  onChange={e => { void switchTeam(e.target.value) }}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => openAddEmail(selectedCampaignId ?? undefined)}
              disabled={!activeTeamId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              New Email
            </button>
            <button
              onClick={() => { void signOut() }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        {(authLoading || isLoading || error || authError) && (
          <div className={`px-6 py-3 text-sm border-b shrink-0 ${(error || authError) ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {authLoading || isLoading ? 'Syncing your workspace...' : error ?? authError}
            {(error || authError) && (
              <button onClick={() => { void reload(); void auth.reload() }} className="ml-3 text-blue-700 hover:text-blue-900 font-medium">
                Retry
              </button>
            )}
          </div>
        )}

        {!activeTeamId ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
              <div className="text-lg font-semibold text-slate-800">No team workspace selected</div>
              <p className="mt-2 text-sm text-slate-500">
                Create a team or join an existing team from the directory.
              </p>
            </div>
          </div>
        ) : (
          <main className="flex-1 overflow-hidden flex flex-col">
            {activeNav === 'analytics'
              ? <Analytics emails={emails} campaigns={campaigns} profile={profile} />
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
        )}
      </div>

      {activeNav === 'settings' && (
        <TeamDirectory
          teams={teams}
          allTeams={allTeams}
          activeTeamId={activeTeamId}
          isSuperadmin={profile.isSuperadmin}
          orgCount={orgCount}
          pendingRequests={pendingRequests}
          onSwitchTeam={teamId => { void switchTeam(teamId) }}
          onCreateTeam={teamName => { void createTeam(teamName) }}
          onRequestJoinTeam={teamId => { void requestJoinTeam(teamId) }}
          onApproveRequest={requestId => { void approveRequest(requestId) }}
          onRejectRequest={requestId => { void rejectRequest(requestId) }}
          onLeaveCurrentTeam={() => { void leaveCurrentTeam() }}
        />
      )}

      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          campaigns={campaigns}
          segments={segments}
          hasConflict={getConflicts(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          onUpdate={(id, updates) => { void updateEmail(id, updates) }}
          onDelete={id => { void deleteEmail(id); setSelectedEmail(null) }}
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
