// Nexorium Core - Input Component
// Premium dark theme

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-white ring-offset-[#0B1220] transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-300',
          'placeholder:text-slate-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FEF]/50 focus-visible:border-[#5B5FEF]/50',
          'hover:border-white/[0.15] hover:bg-white/[0.05]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
