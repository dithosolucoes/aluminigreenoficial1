import { auth, currentUser, isTeacher } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { MOCK_MODE } from '@/lib/config';
import { getProgress } from '@/actions/get-progress';
import { SessionProvider } from '@/components/auth/session-provider';

import { CourseSidebar } from './_components/course-sidebar';
import { CourseNavbar } from './_components/course-navbar';
import { CourseLayoutClient } from './_components/course-layout-client';

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();

  if (!userId) return redirect('/');

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!course)return redirect('/');

  const progressCount = await getProgress(userId, course.id);
  const user = await currentUser();

  const session = {
    userId,
    name: user?.name ?? null,
    email: user?.email ?? null,
    imageUrl: user?.imageUrl ?? null,
    isTeacher: isTeacher(userId),
    mockMode: MOCK_MODE,
  };

  return (
    <SessionProvider session={session}>
      <CourseLayoutClient
        courseId={course.id}
        courseNavbar={<CourseNavbar course={course} progressCount={progressCount} />}
        courseSidebar={<CourseSidebar course={course} progressCount={progressCount} />}
      >
        {children}
      </CourseLayoutClient>
    </SessionProvider>
  );
};

export default CourseLayout;
