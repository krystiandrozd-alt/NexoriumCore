// Nexorium Core - Button Component
// Premium dark theme with gradient and glow effects

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] text-white shadow-lg shadow-[#5B5FEF]/20 hover:shadow-[#5B5FEF]/40 hover:-translate-y-0.5 focus-visible:ring-[#5B5FEF]',
        destructive:
          'bg-red-500/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 focus-visible:ring-red-500',
        outline:
          'border border-white/[0.1] bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white focus-visible:ring-white/20',
        secondary:
          'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white focus-visible:ring-white/20',
        ghost:
          'text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:ring-white/20',
        link:
          'text-[#818CF8] underline-offset-4 hover:underline hover:text-[#A5B4FC] focus-visible:ring-[#5B5FEF]',
        success:
          'bg-emerald-500/90 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus-visible:ring-emerald-500',
        warning:
          'bg-amber-500/90 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 focus-visible:ring-amber-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-lg px-6',
        xl: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
