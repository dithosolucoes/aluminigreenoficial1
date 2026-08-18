'use client';

/**
 * Encerra a sessão e volta para a landing.
 * O navbar aponta para cá nos dois modos.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const SignOutScreen = ({ mockMode }: { mockMode: boolean }) => {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      if (mockMode) {
        await fetch('/api/mock-session', { method: 'DELETE' });
      } else {
        const { useClerk } = await import('@clerk/nextjs');
        // signOut fora de componente: usa a instância global do Clerk.
        const clerk = (window as any).Clerk;
        if (clerk?.signOut) await clerk.signOut();
      }
      router.push('/');
      router.refresh();
    };
    run();
  }, [mockMode, router]);

  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center gap-y-3 text-slate-500'>
      <Loader2 className='h-6 w-6 animate-spin' />
      <p className='text-sm font-medium'>Saindo…</p>
    </div>
  );
};
