import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../lib/utils';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, PropsWithChildren {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-800 text-slate-200',
  info: 'bg-cyan-950 text-cyan-200 ring-1 ring-cyan-900',
  success: 'bg-emerald-950 text-emerald-200 ring-1 ring-emerald-900',
  warning: 'bg-amber-950 text-amber-200 ring-1 ring-amber-900',
  danger: 'bg-rose-950 text-rose-200 ring-1 ring-rose-900',
};

export function Badge({ children, className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
