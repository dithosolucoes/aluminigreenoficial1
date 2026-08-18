import { auth, currentUser, isTeacher } from '@/lib/auth';
import { MOCK_MODE } from '@/lib/config';
import { SessionProvider } from '@/components/auth/session-provider';

import { Navbar } from './_components/navbar';
import { Sidebar } from './_components/sidebar';

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userId } = auth();

  // Visitante: sem casca de painel. É o que deixa a landing page ocupar
  // a tela inteira em `/`.
  if (!userId) {
    return <div className='h-full w-full'>{children}</div>;
  }

  const user = await currentUser();

  const session = {
    userId,
    name: user?.name ?? null,
    email: user?.email ?? null,
    imageUrl: user?.imageUrl ?? null,
    isTeacher: isTeacher(userId, user?.email),
    mockMode: MOCK_MODE,
  };

  return (
    <SessionProvider session={session}>
      <div className='h-full'>
        <div className='h-[80px] md:pl-56 fixed inset-y-0 w-full z-50'>
          <Navbar />
        </div>
        <div className='hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50'>
          <Sidebar />
        </div>
        <main className='md:pl-56 pt-[80px] h-full'>{children}</main>
      </div>
    </SessionProvider>
  );
};

export default DashboardLayout;
