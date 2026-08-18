import { auth } from '@/lib/auth';
import { Chapter, Course, UserProgress } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Award } from 'lucide-react';

import { db } from '@/lib/db';

import { CourseSidebarItem } from './course-sidebar-item';
import { CourseProgress } from '@/components/course-progress';

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const purchaseRow = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  const purchase =
    purchaseRow && purchaseRow.status === 'PAID' && !purchaseRow.isSuspended
      ? purchaseRow
      : null;

  return (
    <div className='h-full border-r flex flex-col overflow-y-auto shadow-sm'>
      <div className='p-8 flex flex-col border-b'>
        <h1 className='font-semibold'>{course.title}</h1>
        {purchase && (
          <div className='mt-10'>
            <CourseProgress variant='success' value={progressCount} />
          </div>
        )}
      </div>
      <div className='flex flex-col w-full'>
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
      {progressCount === 100 && (
        <div className='p-6 border-t mt-auto bg-emerald-50/50'>
          <div className='text-center space-y-2.5'>
            <div className='inline-flex items-center justify-center p-2 rounded-full bg-emerald-100 text-emerald-800 animate-bounce'>
              <Award className='h-6 w-6 text-emerald-700' />
            </div>
            <div className='space-y-1'>
              <p className='font-bold text-xs text-slate-800 uppercase tracking-wide'>Curso Concluído! 🏆</p>
              <p className='text-[10px] text-slate-500'>Seu certificado Alumini Green está disponível para download.</p>
            </div>
            <a
              href={`/api/student/certificate/${course.id}`}
              target='_blank'
              rel='noopener noreferrer'
              className='w-full flex items-center justify-center gap-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-md transition shadow-md hover:shadow-lg active:scale-95 uppercase tracking-wide'
            >
              Baixar Certificado
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
