import type { PropsWithChildren } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="space-y-6">
      <Header />
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar />
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
