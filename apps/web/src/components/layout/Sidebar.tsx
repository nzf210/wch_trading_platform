const items = [
  { href: '#auth', label: 'Auth' },
  { href: '#bots', label: 'Bots' },
  { href: '#risk', label: 'Risk' },
  { href: '#subscription', label: 'Subscription' },
  { href: '#exchange', label: 'Exchange' },
  { href: '#wallet', label: 'Wallet' },
  { href: '#signals', label: 'Signals' },
];

export function Sidebar() {
  return (
    <aside className="rounded-[32px] border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,8,23,0.92))] p-5">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300">Navigation</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Single-page operational view for validating FE contracts against the live API surface.
          </p>
        </div>

        <nav className="space-y-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
