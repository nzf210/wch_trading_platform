import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, id, ...props },
  ref,
) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-200">{label}</span> : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400',
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
});
