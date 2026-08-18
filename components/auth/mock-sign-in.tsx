'use client';

/**
 * Seletor de perfil do modo mock — substitui o <SignIn> do Clerk em /sign-in
 * enquanto NEXT_PUBLIC_MOCK_MODE=true.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, GraduationCap, Users, Loader2 } from 'lucide-react';

import { MOCK_USERS } from '@/lib/auth/mock-users';

export const MockSignIn = () => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const selectUser = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/mock-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error();
      router.push('/');
      router.refresh();
    } catch {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-x-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        Ambiente de demonstração — escolha um perfil de teste
      </div>

      <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
        Entrar como…
      </h1>
      <p className="text-xs text-slate-500 font-medium mb-6">
        Você pode trocar de perfil a qualquer momento pelo menu no canto superior direito.
      </p>

      <div className="flex flex-col gap-y-3">
        {MOCK_USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => selectUser(u.id)}
            disabled={loadingId !== null}
            className="flex items-center gap-x-4 text-left border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 rounded-xl p-4 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              {u.role === 'TEACHER' ? (
                <GraduationCap className="h-5 w-5" />
              ) : (
                <Users className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{u.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{u.hint}</p>
            </div>
            {loadingId === u.id ? (
              <Loader2 className="h-4 w-4 text-emerald-600 animate-spin shrink-0" />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                {u.role === 'TEACHER' ? 'Professor' : 'Aluno'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
