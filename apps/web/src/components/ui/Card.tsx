import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-slate-800 bg-slate-900/75 shadow-[0_0_0_1px_rgba(15,23,42,0.24)] backdrop-blur',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('space-y-2 border-b border-slate-800 px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn('text-sm leading-6 text-slate-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}
