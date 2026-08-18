'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useSession } from '@/components/auth/session-provider';
import { UserMenu } from '@/components/auth/user-menu';

import { SearchInput } from './search-input';

export const NavbarRoutes = () => {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isTeacherPage = pathname?.startsWith('/teacher');
  const isCoursePage = pathname?.includes('/courses');
  const isSearchPage = pathname === '/search';

  const handleSignOut = async () => {
    if (session.mockMode) {
      try {
        await fetch('/api/mock-session', { method: 'DELETE' });
      } catch (e) {
        console.error('Erro ao sair:', e);
      }
      window.location.href = '/';
      return;
    }
    // Em modo real quem encerra a sessão é o Clerk.
    window.location.href = '/sign-out';
  };

  return (
    <>
      {isSearchPage && (
        <div className='hidden md:block'>
          <SearchInput />
        </div>
      )}
      <div className='flex gap-x-2 ml-auto items-center'>
        {isTeacherPage || isCoursePage ? (
          <Link href='/'>
            <Button size='sm' variant='ghost'>
              <LogOut className='h-4 w-4 mr-2' />
              Voltar ao Painel
            </Button>
          </Link>
        ) : session.isTeacher ? (
          <Link href='/teacher/courses'>
            <Button size='sm' variant='ghost'>
              Painel do Instrutor
            </Button>
          </Link>
        ) : null}

        {session.userId && (
          <>
            <Button
              onClick={handleSignOut}
              size='sm'
              variant='ghost'
              className='text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold gap-x-2'
            >
              <LogOut className='h-4 w-4' />
              <span className='hidden sm:inline'>Sair</span>
            </Button>
            <UserMenu />
          </>
        )}
      </div>
    </>
  );
};
