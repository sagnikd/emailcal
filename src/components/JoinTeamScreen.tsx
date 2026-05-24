import { useState } from 'react'
import { Team, JoinRequest } from '../types'

interface Props {
  allTeams: Team[]
  myJoinRequests: JoinRequest[]
  onRequestJoin: (teamId: string) => void
  onSignOut: () => void
}

export default function JoinTeamScreen({ allTeams, myJoinRequests, onRequestJoin, onSignOut }: Props) {
  const [requested, setRequested] = useState<Set<string>>(new Set())

  const pendingTeamIds = new Set(
    myJoinRequests.filter(r => r.status === 'pending').map(r => r.team_id)
  )

  const handleRequest = (teamId: string) => {
    setRequested(prev => new Set(prev).add(teamId))
    onRequestJoin(teamId)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-slate-800 mb-2">Welcome to EmailCal</div>
          <p className="text-slate-500">
            You are not part of any team yet. Request to join an existing workspace below.
            An admin will need to approve your request before you can access their emails.
          </p>
        </div>

        {myJoinRequests.filter(r => r.status === 'pending').length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="text-sm font-semibold text-amber-800 mb-2">Pending Requests</div>
            {myJoinRequests.filter(r => r.status === 'pending').map(r => (
              <div key={r.id} className="text-sm text-amber-700 flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>Waiting for approval to join <strong>{r.team_name}</strong></span>
              </div>
            ))}
          </div>
        )}

        {myJoinRequests.filter(r => r.status === 'rejected').length > 0 && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
            <div className="text-sm font-semibold text-rose-800 mb-2">Rejected Requests</div>
            {myJoinRequests.filter(r => r.status === 'rejected').map(r => (
              <div key={r.id} className="text-sm text-rose-700 flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>Your request to join <strong>{r.team_name}</strong> was declined. You may request again.</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-700">Available Workspaces</div>
          </div>
          {allTeams.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-500">
              No workspaces available yet. Ask your admin to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allTeams.map(team => {
                const isPending = pendingTeamIds.has(team.id) || requested.has(team.id)
                return (
                  <div key={team.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{team.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">/{team.slug}</div>
                    </div>
                    <button
                      onClick={() => handleRequest(team.id)}
                      disabled={isPending}
                      className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isPending ? 'Requested' : 'Request to Join'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onSignOut}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
