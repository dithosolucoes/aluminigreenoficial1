import { GraduationCap, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

const AuthLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return ( 
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      
      {/* Visual Brand Panel - Hidden on Mobile, Premium on Desktop */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Glowing Orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(20,184,166,0.1),transparent_40%)] pointer-events-none" />
        
        {/* Header Branding */}
        <div className="relative z-10 flex items-center gap-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight leading-none">
              Alumini <span className="text-emerald-400">Green</span>
            </span>
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
              Portal do Aluno
            </span>
          </div>
        </div>

        {/* Core Value Copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-x-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Metodologia Ativa e Prática
          </div>
          <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Desenvolva a liderança do <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              seu próprio negócio
            </span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-sm font-medium">
            Entre para o ecossistema que conecta a melhor formação acadêmica com a inovação corporativa que seu negócio precisa.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-x-3 text-xs text-slate-200 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Cursos e mentorias 100% online</span>
            </div>
            <div className="flex items-center gap-x-3 text-xs text-slate-200 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Corpo docente renomado</span>
            </div>
            <div className="flex items-center gap-x-3 text-xs text-slate-200 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Suporte e consultorias personalizadas</span>
            </div>
          </div>
        </div>

        {/* Footer Brand Credit */}
        <div className="relative z-10 text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500/70" />
          <span>Segurança & Certificação Alumini Green</span>
        </div>
      </div>

      {/* Form Container Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle branding on mobile auth screen */}
        <div className="lg:hidden flex items-center gap-x-2.5 mb-10">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight leading-none text-slate-900">
            Alumini <span className="text-emerald-600">Green</span>
          </span>
        </div>

        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full relative z-10">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}

export default AuthLayout;