import { Category, Course } from "@prisma/client";
import { GraduationCap, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

import { CourseCard } from "@/components/course-card";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface CoursesListProps {
  items: CourseWithProgressWithCategory[];
  emptyMessage?: string;
  emptySubtitle?: string;
}

export const CoursesList = ({
  items,
  emptyMessage = "Sua jornada começa aqui!",
  emptySubtitle = "Você ainda não tem cursos em andamento. Descubra trilhas de aprendizado incríveis em nossa plataforma.",
}: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            chaptersLength={item.chapters.length}
            price={item.price!}
            progress={item.progress}
            category={item?.category?.name!}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[320px] bg-gradient-to-b from-slate-50/50 to-white border border-slate-100 rounded-2xl p-8 text-center mt-6 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5 border border-emerald-100/50">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {emptyMessage}
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6 font-medium leading-relaxed">
            {emptySubtitle}
          </p>
          <Link 
            href="/search"
            className="group flex items-center gap-x-2 text-white bg-emerald-600 hover:bg-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm shadow-emerald-600/10 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            Explorar catálogo de cursos
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  )
}