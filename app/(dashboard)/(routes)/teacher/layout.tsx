import { isTeacher, auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) return redirect('/sign-in');

  const user = await currentUser();
  if (!isTeacher(userId, user?.email)) return redirect('/'); 

  return <>{children}</>;
};

export default TeacherLayout;
