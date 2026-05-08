import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <header className="flex flex-col gap-4 rounded-[32px] border border-slate-800 bg-slate-900/70 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">WCH Control Surface</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Frontend execution console</h1>
          <Badge tone={status === 'authenticated' ? 'success' : 'warning'}>
            {status === 'authenticated' ? 'session loaded' : 'no session'}
          </Badge>
        </div>
        <p className="text-sm text-slate-400">
          {user ? `${user.email}${user.tenantId ? ` · ${user.tenantId}` : ''}` : 'Use the auth form below to test typed API flows.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
          {'Runtime path: auth -> bots -> risk -> subscription -> exchange -> wallet -> signals'}
        </div>
        {status === 'authenticated' ? (
          <Button variant="ghost" onClick={() => clearSession()}>
            Clear session
          </Button>
        ) : null}
      </div>
    </header>
  );
}
