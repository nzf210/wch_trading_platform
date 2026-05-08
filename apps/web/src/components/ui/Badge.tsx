import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../lib/utils';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, PropsWithChildren {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/50',
  info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
};

export function Badge({ children, className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
