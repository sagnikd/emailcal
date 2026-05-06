import { useState } from 'react'
import { Team } from '../types'

interface Props {
  teams: Team[]
  activeTeamId: string | null
  isSuperadmin: boolean
  orgCount: number
  onSwitchTeam: (teamId: string) => void
  onCreateTeam: (teamName: string) => void
  onJoinTeam: (teamSlug: string) => void
  onLeaveCurrentTeam: () => void
}

export default function TeamDirectory({
  teams,
  activeTeamId,
  isSuperadmin,
  orgCount,
  onSwitchTeam,
  onCreateTeam,
  onJoinTeam,
  onLeaveCurrentTeam,
}: Props) {
  const [newTeamName, setNewTeamName] = useState('')
  const [joinSlug, setJoinSlug] = useState('')

  return (
    <div className="w-80 shrink-0 border-l border-slate-200 bg-white/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{isSuperadmin ? 'Superadmin' : 'Workspace'}</div>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">Team Directory</h2>
        <p className="mt-1 text-sm text-slate-500">Create, join, leave, and switch teams at any time.</p>
        {isSuperadmin && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Organizations created: <span className="font-semibold">{orgCount}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-5">
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
            You do not belong to any team yet. Create one or join by slug.
          </div>
        )}
      </div>

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

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Join Team</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Team slug"
              value={joinSlug}
              onChange={e => setJoinSlug(e.target.value)}
            />
            <button
              onClick={() => {
                if (!joinSlug.trim()) return
                onJoinTeam(joinSlug.trim())
                setJoinSlug('')
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              Join
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
