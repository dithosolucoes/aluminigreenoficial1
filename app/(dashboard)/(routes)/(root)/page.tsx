import { CheckCircle, Clock, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth, isTeacher } from '@/lib/auth';

import { getDashboardCourses } from '@/actions/get-dashboard-courses';
import { CoursesList } from '@/components/courses-list';
import { InfoCard } from './_components/info-card';
import { LandingPage } from './_components/landing-page';

export default async function Dashboard() {
  const { userId } = auth();
  
  if (!userId) {
    return <LandingPage />;
  }

  // Se o usuário for Professor/Administrador, redireciona diretamente para a área de gestão
  if (isTeacher(userId)) {
    return redirect('/teacher/courses');
  }

  const { completedCourses, coursesInProgress } =
    await getDashboardCourses(userId);

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      {/* Premium Hero Banner */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-slate-950/15 border border-emerald-900/40'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_50%)] pointer-events-none' />
        <div className='absolute -right-8 -bottom-8 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none' />
        
        <div className='relative z-10 flex flex-col gap-y-2'>
          <div className='flex items-center gap-x-2 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full w-fit text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1'>
            <Sparkles className='h-3.5 w-3.5' />
            Espaço do Aluno
          </div>
          <h1 className='text-2xl md:text-3xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent'>
            Seja muito bem-vindo! 👋
          </h1>
          <p className='text-slate-300 text-xs md:text-sm max-w-xl font-medium mt-1 leading-relaxed'>
            Gerencie seu aprendizado de forma inteligente. Veja suas estatísticas e retome as aulas de onde parou.
          </p>
        </div>
      </div>

      {/* Metrics Section */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <InfoCard 
          icon={Clock}
          label='Em progresso'
          numberOfItems = {coursesInProgress.length}
        />
        <InfoCard 
          icon={CheckCircle}
          label='Concluídos'
          numberOfItems = {completedCourses.length}
          variant='success'
        />
      </div>

      {/* Courses List Section */}
      <div className='space-y-4 pt-2'>
        <div className='flex items-center justify-between border-b border-slate-100 pb-2.5'>
          <h2 className='text-lg font-bold text-slate-800 tracking-tight'>
            Meus Cursos Acadêmicos
          </h2>
        </div>
        <CoursesList items={[...coursesInProgress, ...completedCourses]} />
      </div>
    </div>
  );
}
