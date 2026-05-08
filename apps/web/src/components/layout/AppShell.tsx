import type { PropsWithChildren } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <div className="mx-6 pb-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar />
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
