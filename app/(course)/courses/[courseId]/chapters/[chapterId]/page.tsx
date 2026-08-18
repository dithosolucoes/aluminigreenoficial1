import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { File, Award } from 'lucide-react';

import { getChaper } from '@/actions/get-chapter';
import { getPlaybackUrl } from '@/lib/video';
import { getProgress } from '@/actions/get-progress';
import { Separator } from '@/components/ui/separator';
import Banner from '@/components/banner';
import { Preview } from '@/components/preview';

import { VideoPlayer } from './_components/video-player';
import { CourseEnrollButton } from './_components/course-enroll-button';
import { CourseProgressButton } from './_components/course-progress-button';
import { ChapterQuestions } from './_components/chapter-questions';

const ChaperIdPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
  };
}) => {
  const { userId } = auth();
  if (!userId) return redirect('/');

  const {
    chapter,
    course,
    videoAsset,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChaper({
    userId,
    courseId: params.courseId,
    chapterId: params.chapterId,
  });

  if (!chapter || !course) return redirect('/');

  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  const progressCount = await getProgress(userId, params.courseId);
  const isCompletedCourse = progressCount === 100;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant='success' label='Capítulo concluído com sucesso!' />
      )}
      {isLocked && (
        <Banner
          variant='warning'
          label='Você precisa adquirir este curso para visualizar este capítulo.'
        />
      )}
      {isCompletedCourse && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-emerald-950 shadow-inner">
          <div className="flex items-center gap-x-3 text-center md:text-left flex-col md:flex-row">
            <div className="p-2 rounded-full bg-emerald-700 border border-emerald-600 text-amber-300 animate-pulse">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">Parabéns! Você concluiu 100% deste curso! 🎉</h3>
              <p className="text-xs text-emerald-200 mt-0.5">Seu Certificado de Conclusão oficial emitido pela Alumini Green está disponível.</p>
            </div>
          </div>
          <a
            href={`/api/student/certificate/${params.courseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all active:scale-95 uppercase tracking-wider flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Imprimir Certificado
          </a>
        </div>
      )}
      <div className='flex flex-col max-w-4xl mx-auto pb-20'>
        <div className='p-4'>
          <VideoPlayer
            courseId={params.courseId}
            chapterId={params.chapterId}
            title={chapter.title}
            nextChapterId={nextChapter?.id}
            playbackUrl={videoAsset ? getPlaybackUrl(videoAsset) : null}
            provider={videoAsset?.provider ?? 'MOCK'}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
        <div className=''>
          <div className='p-4 flex flex-col md:flex-row items-center justify-between'>
            <h2 className='text-2xl font-semibold mb-2'>{chapter.title}</h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator />
          <div className=''>
            <Preview value={chapter.description!} />
          </div>
          {!!attachments.length && (
            <>
              <Separator />
              <div className='p-4'>
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target='_blank'
                    key={attachment.id}
                    className='flex items-center p-3 w-full bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-md hover:underline'
                  >
                    <File />
                    <p className='line-clamp-1'>{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}
          <ChapterQuestions
            courseId={params.courseId}
            chapterId={params.chapterId}
          />
        </div>
      </div>
    </div>
  );
};

export default ChaperIdPage;
