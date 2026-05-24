import { useState } from 'react'
import { Team, PendingRequest } from '../types'

interface Props {
  teams: Team[]
  allTeams: Team[]
  activeTeamId: string | null
  isSuperadmin: boolean
  orgCount: number
  pendingRequests: PendingRequest[]
  onSwitchTeam: (teamId: string) => void
  onCreateTeam: (teamName: string) => void
  onRequestJoinTeam: (teamId: string) => void
  onApproveRequest: (requestId: string) => void
  onRejectRequest: (requestId: string) => void
  onLeaveCurrentTeam: () => void
}

export default function TeamDirectory({
  teams,
  allTeams,
  activeTeamId,
  isSuperadmin,
  orgCount,
  pendingRequests,
  onSwitchTeam,
  onCreateTeam,
  onRequestJoinTeam,
  onApproveRequest,
  onRejectRequest,
  onLeaveCurrentTeam,
}: Props) {
  const [newTeamName, setNewTeamName] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    onApproveRequest(id)
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    onRejectRequest(id)
  }

  return (
    <div className="w-96 shrink-0 border-l border-slate-200 bg-white/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{isSuperadmin ? 'Superadmin' : 'Workspace'}</div>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">Team Directory</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your team workspaces.</p>
        {isSuperadmin && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Organizations created: <span className="font-semibold">{orgCount}</span>
          </div>
        )}
      </div>

      {/* Pending Join Requests (visible to admins/members) */}
      {pendingRequests.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Join Requests
            <span className="rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
              {pendingRequests.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingRequests.map(req => (
              <div key={req.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                <div className="text-sm font-semibold text-slate-800">{req.user_full_name}</div>
                <div className="text-xs text-slate-500">{req.user_email}</div>
                <div className="text-xs text-amber-700 mt-0.5">Wants to join <strong>{req.team_name}</strong></div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-rose-200 text-rose-700 font-medium hover:bg-rose-50 disabled:opacity-50 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Teams */}
      <div className="space-y-2 mb-5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">My Teams</div>
        {teams.map(team => (
          <button
            key={team.id}
            onClick={() => onSwitchTeam(team.id)}
            className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${activeTeamId === team.id ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">{team.name}</div>
                <div className="text-xs text-slate-500 mt-1">/{team.slug}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-700">{team.memberCount}</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Members</div>
              </div>
            </div>
          </button>
        ))}

        {teams.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            You do not belong to any team yet.
          </div>
        )}
      </div>

      {/* All Organizations */}
      <div className="space-y-2 mb-5 border-t border-slate-100 pt-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">All Workspaces</div>
        {allTeams.map(team => {
          const isMember = teams.some(t => t.id === team.id)
          const isActive = activeTeamId === team.id
          return (
            <div key={team.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-sm font-semibold text-slate-800">{team.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">/{team.slug}</div>
              <div className="mt-2">
                {isMember ? (
                  <button
                    onClick={() => onSwitchTeam(team.id)}
                    disabled={isActive}
                    className="text-xs px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isActive ? 'Current Team' : 'Switch'}
                  </button>
                ) : (
                  <button
                    onClick={() => onRequestJoinTeam(team.id)}
                    className="text-xs px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Request to Join
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {allTeams.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
            No organizations available yet.
          </div>
        )}
      </div>

      {/* Create Team */}
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Create Team</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="e.g. Growth Marketing"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
            />
            <button
              onClick={() => {
                if (!newTeamName.trim()) return
                onCreateTeam(newTeamName.trim())
                setNewTeamName('')
              }}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        <button
          onClick={onLeaveCurrentTeam}
          disabled={!activeTeamId}
          className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
        >
          Leave Current Team
        </button>
      </div>
    </div>
  )
}
