'use client';

import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSession } from './session-provider';

/**
 * Em modo mock não existe ClerkProvider no ar, então <UserButton> nunca
 * pode ser renderizado — aqui vira um avatar com o nome do perfil escolhido
 * e um botão de trocar/sair, que chama a mesma rota que sign-out-screen usa.
 */
export const UserMenu = () => {
  const session = useSession();
  const router = useRouter();

  if (!session.userId) return null;

  if (session.mockMode) {
    const initial = session.name?.trim()?.[0]?.toUpperCase() ?? '?';

    return (
      <button
        onClick={async () => {
          await fetch('/api/mock-session', { method: 'DELETE' });
          router.push('/');
          router.refresh();
        }}
        title={`${session.name ?? 'Perfil de teste'} — clique para trocar`}
        className="flex items-center gap-x-2 group"
      >
        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
          {initial}
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9 ring-2 ring-emerald-500/20"
          }
        }}
      />
    </div>
  );
};

