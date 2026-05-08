const items = [
  { href: '#auth', label: 'Authentication', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { href: '#bots', label: 'Trading Bots', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '#risk', label: 'Risk Management', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { href: '#subscription', label: 'Subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: '#exchange', label: 'Exchange Accounts', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { href: '#wallet', label: 'Wallet & Assets', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: '#signals', label: 'Signal Scanner', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
];

export function Sidebar() {
  return (
    <aside className="sticky top-24 h-fit rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-xl">
      {/* Sidebar Header */}
      <div className="border-b border-slate-800/50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Navigation</p>
        <p className="mt-1 text-xs text-slate-500">Control Panel</p>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition-all duration-200 hover:bg-slate-800/50 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50 transition-colors group-hover:bg-cyan-500/20">
                  <svg className="h-4 w-4 text-slate-500 transition-colors group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </span>
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800/50 px-5 py-4">
        <div className="rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4">
          <p className="text-xs font-medium text-cyan-400">Enterprise Features</p>
          <p className="mt-1 text-xs text-slate-500">Advanced risk controls & analytics</p>
        </div>
      </div>
    </aside>
  );
}
