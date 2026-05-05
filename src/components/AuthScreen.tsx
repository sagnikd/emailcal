import { useState } from 'react'

interface Props {
  onSignIn: (email: string, password: string) => void
  onSignUp: (email: string, password: string, fullName: string, teamName: string) => void
  error: string | null
  info: string | null
  isLoading: boolean
}

export default function AuthScreen({ onSignIn, onSignUp, error, info, isLoading }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [teamName, setTeamName] = useState('')

  const canSubmit = email.trim() && password.trim() && (mode === 'signIn' || (fullName.trim() && teamName.trim()))

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-[1.1fr_0.9fr] bg-white/80 backdrop-blur-xl border border-white rounded-[28px] shadow-[0_24px_80px_rgba(15,23,42,0.10)] overflow-hidden">
        <div className="px-10 py-12 bg-slate-950 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
              EmailsCal
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-tight">Team workspaces for email planning, reviews, and launch calendars.</h1>
            <p className="mt-5 text-sm leading-6 text-slate-300 max-w-md">
              Every sign-up gets its own team workspace. Sign back in to reopen the same workspace, while the superadmin account can review every team across the organization.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              ['Scoped data', 'Each team sees only its own campaigns, emails, and comments.'],
              ['Shared planning', 'Campaigns, segments, and reviews stay together in one workspace.'],
              ['Admin oversight', 'Superadmin can switch across teams and inspect adoption.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-slate-300 mt-2 leading-5">{copy}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-10">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 mb-6">
            {[
              ['signIn', 'Sign In'],
              ['signUp', 'Create Team'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id as 'signIn' | 'signUp')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'signUp' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Full Name</label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Team Name</label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Growth Marketing" />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Email</label>
              <input type="email" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Password</label>
              <input type="password" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2.5">{error}</div>
            )}
            {info && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm px-3 py-2.5">{info}</div>
            )}

            <button
              disabled={!canSubmit || isLoading}
              onClick={() => {
                if (mode === 'signIn') onSignIn(email, password)
                else onSignUp(email, password, fullName, teamName)
              }}
              className="w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Working...' : mode === 'signIn' ? 'Sign In' : 'Create Account and Team'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
