import { Team } from '../types'

interface Props {
  teams: Team[]
  activeTeamId: string | null
  isSuperadmin: boolean
  onSwitchTeam: (teamId: string) => void
}

export default function TeamDirectory({ teams, activeTeamId, isSuperadmin, onSwitchTeam }: Props) {
  if (!isSuperadmin) return null

  return (
    <div className="w-80 shrink-0 border-l border-slate-200 bg-white/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Superadmin</div>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">Team Directory</h2>
        <p className="mt-1 text-sm text-slate-500">Switch workspaces to inspect what each team has created.</p>
      </div>

      <div className="space-y-2">
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
            No teams have signed up yet.
          </div>
        )}
      </div>
    </div>
  )
}
