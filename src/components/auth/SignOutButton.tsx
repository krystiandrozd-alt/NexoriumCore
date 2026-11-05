'use client';

// Nexorium Core - Sign-out button
// Ends the Neon Auth session and returns to the login page.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth/client';

interface SignOutButtonProps {
  /** Icon-only rendering for the collapsed sidebar */
  collapsed?: boolean;
  className?: string;
}

export function SignOutButton({ collapsed = false, className }: SignOutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    try {
      await authClient.signOut();
      router.push('/login');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      title={collapsed ? 'Sign out' : undefined}
      className={cn(
        'flex w-full items-center rounded-lg text-sm font-medium text-slate-400 transition-all duration-200',
        'hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
        collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        className
      )}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5 flex-shrink-0" />
      )}
      {!collapsed && <span>Sign out</span>}
    </button>
  );
}
