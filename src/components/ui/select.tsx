// Nexorium Core - Select Component
// Premium dark theme

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 pr-10 text-sm text-white ring-offset-[#0B1220] transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FEF]/50 focus-visible:border-[#5B5FEF]/50',
            'hover:border-white/[0.15] hover:bg-white/[0.05]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&>option]:bg-[#0F1729] [&>option]:text-white',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
