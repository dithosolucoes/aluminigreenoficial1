import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/payment";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Play, 
  Lock, 
  Sparkles, 
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { CourseEnrollCard } from "./_components/course-enroll-card";

const CourseIdPage = async ({
  params
}: {
  params: { courseId: string; }
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      category: true,
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  });

  if (!course || course.chapters.length === 0) {
    return redirect("/");
  }

  const userHasAccess = await hasAccess(userId, course.id);

  // If already purchased or manual, go straight to the first chapter of the course
  if (userHasAccess) {
    return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
  }

  // Otherwise, present a gorgeous premium Course Sales Landing Page!
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fadeIn">
      {/* Back button */}
      <Link 
        href="/search" 
        className="group inline-flex items-center gap-x-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mb-8 uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Voltar para o catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Column: Course details and curriculum */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Hero Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {course.category && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {course.category.name}
                </span>
              )}
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Matrículas Abertas
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              Domine as melhores práticas com uma trilha formativa profissional completa, elaborada pela Alumini Green e lideranças de mercado.
            </p>

            {/* Quick Metadata Stats */}
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs sm:text-sm font-medium pt-2">
              <div className="flex items-center gap-x-1.5 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/40">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span>
                  {course.chapters.length} {course.chapters.length === 1 ? "Capítulo" : "Capítulos"}
                </span>
              </div>
              <div className="flex items-center gap-x-1.5 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/40">
                <Award className="h-4 w-4 text-slate-400" />
                <span>Certificado Incluso</span>
              </div>
              <div className="flex items-center gap-x-1.5 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/40">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </div>

          {/* Cover image (visible on smaller screens, hidden on lg desktop) */}
          <div className="block lg:hidden relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100">
            <Image 
              src={course.imageUrl || "https://picsum.photos/seed/lms/800/450"} 
              alt={course.title}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* About this Course */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Sobre o curso</h2>
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
              {course.description || "Este curso oferece uma capacitação de alto nível voltada para profissionais que buscam excelência técnica e atualização em conceitos modernos de governança e sustentabilidade. Através de módulos estruturados, você terá acesso a cases práticos e análises aprofundadas."}
            </div>
          </div>

          {/* Key Learnings (The "Premium" anti-slop presentation grid) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">O que você vai aprender</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Princípios Práticos Reais",
                  desc: "Aprenda como as empresas líderes aplicam práticas reais de governança e sustentabilidade na rotina diária."
                },
                {
                  title: "Métricas e Relatórios",
                  desc: "Domine o cálculo de pegada ecológica, relatórios de impacto de carbono e métricas GRI estruturadas."
                },
                {
                  title: "Economia e Impacto",
                  desc: "Desenvolva análises de ciclos de vida dos materiais, mitigando custos e agregando valor de marca."
                },
                {
                  title: "Análises de Caso",
                  desc: "Acesse estudos de caso detalhados com soluções práticas explicadas de ponta a ponta pelos professores."
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-x-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/50 transition duration-300">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Curriculum / Chapter List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-slate-800">Conteúdo do curso</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Confira a grade curricular completa dividida em capítulos
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                {course.chapters.length} Aulas
              </span>
            </div>

            <div className="space-y-3">
              {course.chapters.map((chapter, index) => {
                const isFree = chapter.isFree;
                return (
                  <div 
                    key={chapter.id}
                    className={`group border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-300 ${
                      isFree 
                        ? "bg-emerald-50/20 border-emerald-100 hover:border-emerald-200 hover:shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-200/80 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-x-4">
                      {/* Number Index Indicator */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm border flex-shrink-0 ${
                        isFree 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors">
                            {chapter.title}
                          </h3>
                          {isFree && (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Demonstração Grátis
                            </span>
                          )}
                        </div>
                        {chapter.description && (
                          <p className="text-slate-500 text-xs leading-relaxed max-w-xl font-medium line-clamp-2">
                            {chapter.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isFree ? (
                        <Link
                          href={`/courses/${course.id}/chapters/${chapter.id}`}
                          className="flex items-center gap-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3.5 py-2 rounded-xl transition duration-200 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-emerald-700" />
                          Assistir Preview
                        </Link>
                      ) : (
                        <div className="flex items-center gap-x-1.5 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl select-none">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          Exclusivo para Alunos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Showcase Section */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
            {/* Visual background blob */}
            <div className="absolute right-0 top-0 w-[320px] h-[320px] bg-emerald-600/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="h-4 w-4" />
                  Certificação Profissional
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Eleve seu nível profissional com nossa certificação
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Ao concluir 100% das aulas práticas, discussões e questionários da grade, seu certificado digital oficial será gerado imediatamente de forma gratuita, pronto para exportar para o LinkedIn e valorizar seu currículo.
                </p>
              </div>

              {/* Certificate Mock Mini Preview */}
              <div className="w-full md:w-[240px] bg-white text-slate-900 border border-slate-200 p-4 rounded-xl shadow-2xl relative select-none rotate-2 hover:rotate-0 transition duration-500 flex-shrink-0">
                <div className="border-4 border-double border-emerald-700/30 p-3 h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-center">
                    <p className="text-[8px] font-extrabold text-emerald-800 uppercase tracking-widest">Alumini Green</p>
                    <p className="text-[12px] font-serif font-bold text-slate-800 leading-none">CERTIFICADO</p>
                    <div className="w-8 h-[1px] bg-slate-300 mx-auto" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[6px] text-slate-400 font-medium">Concedido com honra ao aluno pela conclusão do curso</p>
                    <p className="text-[9px] font-bold text-slate-800 font-serif italic border-b border-slate-100 pb-1 max-w-[140px] mx-auto truncate">Nome do Aluno</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-[4px] text-slate-400">Emissão Oficial</p>
                      <p className="text-[5px] font-bold text-slate-700">Validação Digital</p>
                    </div>
                    <div className="h-5 w-5 border border-amber-400/50 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                      <Award className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Sticky Purchase Card */}
        <div className="lg:col-span-1">
          <CourseEnrollCard courseId={course.id} price={course.price ?? 0} />
        </div>
      </div>
    </div>
  );
}

export default CourseIdPage;
