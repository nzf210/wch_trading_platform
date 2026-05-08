import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">WCH Trading Platform</h1>
              <p className="text-xs text-slate-500">Enterprise Control Center</p>
            </div>
          </div>

          {/* Center - Status */}
          <div className="hidden items-center gap-6 lg:flex">
            <Badge tone={status === 'authenticated' ? 'success' : 'warning'}>
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${status === 'authenticated' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {status === 'authenticated' ? 'Connected' : 'Disconnected'}
              </span>
            </Badge>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-sm text-slate-400">v2.0 Enterprise</span>
          </div>

          {/* Right - User Info */}
          <div className="flex items-center gap-4">
            {status === 'authenticated' ? (
              <>
                <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 md:flex">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.email || 'User'}</p>
                    <p className="text-xs text-slate-500">{user?.tenantId || 'Enterprise Account'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => clearSession()}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </>
            ) : (
              <span className="text-sm text-slate-500">Not authenticated</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
