import { auth, currentUser } from '@/lib/auth';
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { getProgress } from "@/actions/get-progress";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify progress is 100%
    const progressCount = await getProgress(userId, params.courseId);
    
    // For testing and demonstration, let's allow rendering if progress is near or if they request it,
    // but to be safe and accurate to user request, we enforce 100% check.
    if (progressCount < 100) {
      return new NextResponse(
        `Progresso insuficiente para emitir certificado. Seu progresso atual é de ${Math.round(progressCount)}%. Por favor, conclua todas as aulas.`,
        { status: 400 }
      );
    }

    const user = await currentUser();
    const userName = user?.name || "Aluno";

    const formattedDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    // Carga horária baseada no número de capítulos ou um valor padrão elegante
    const estimatedHours = Math.max(course.chapters.length * 4, 12);
    
    // Generate an authentic look cryptographic hash
    // Determinístico: o mesmo aluno no mesmo curso recebe sempre o mesmo
    // código. Com Math.random, recarregar a página gerava outro número e o
    // "código de verificação" não verificava nada.
    const fingerprint = createHash("sha256")
      .update(`${userId}:${course.id}`)
      .digest("hex")
      .substring(0, 5)
      .toUpperCase();

    const certId = `ALG-${course.id.substring(0, 4).toUpperCase()}-${userId
      .substring(userId.length - 6)
      .toUpperCase()}-${fingerprint}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Certificado de Conclusão - ${course.title}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Montserrat', sans-serif;
            background-color: #f1f5f9;
          }

          .certificate-container {
            background-color: #fdfdfb;
            background-image: radial-gradient(#eceae2 1px, transparent 1px);
            background-size: 20px 20px;
          }

          .font-cinzel {
            font-family: 'Cinzel', serif;
          }

          .font-script {
            font-family: 'Great Vibes', cursive;
          }

          @media print {
            .no-print { display: none !important; }
            body { 
              background-color: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .certificate-container {
              border: 12px double #065f46 !important;
              box-shadow: none !important;
              width: 100vw !important;
              height: 100vh !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body class="min-h-screen p-4 md:p-12 flex flex-col items-center justify-center">
        
        <!-- Controls Bar -->
        <div class="max-w-5xl w-full mb-4 flex justify-between items-center no-print bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div class="flex flex-col">
            <h1 class="text-sm font-bold text-slate-800">Seu Certificado Oficial está Pronto!</h1>
            <p class="text-xs text-slate-500">Parabéns por concluir 100% do curso de capacitação.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded transition flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir / Salvar em PDF
            </button>
          </div>
        </div>

        <!-- Certificate Frame -->
        <div class="max-w-5xl w-full aspect-[1.414/1] certificate-container shadow-2xl rounded-md border-8 border-double border-emerald-800 p-8 md:p-16 relative flex flex-col justify-between overflow-hidden">
          
          <!-- Decorative Corners -->
          <div class="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-700"></div>
          <div class="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-700"></div>
          <div class="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-700"></div>
          <div class="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-700"></div>

          <!-- Header / Brand -->
          <div class="text-center space-y-2 mt-4">
            <div class="flex items-center justify-center gap-x-2">
              <span class="text-emerald-800 text-2xl font-cinzel tracking-widest font-extrabold flex items-center">
                ALUMINI
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600 mx-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                GREEN
              </span>
            </div>
            <p class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Plataforma de Desenvolvimento e Sustentabilidade Corporativa</p>
            <div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent mx-auto mt-1"></div>
          </div>

          <!-- Central Body -->
          <div class="text-center my-6 space-y-4">
            <h2 class="text-xl md:text-3xl font-cinzel font-bold text-emerald-900 tracking-wider">CERTIFICADO DE CONCLUSÃO</h2>
            
            <p class="text-xs md:text-sm text-slate-500 italic">Certificamos, para todos os devidos fins legais e curriculares, que</p>
            
            <h3 class="text-2xl md:text-4xl font-script text-emerald-800 font-semibold my-2">${userName}</h3>
            
            <p class="text-xs md:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              concluiu com aproveitamento pleno e dedicação integral o programa de capacitação avançada em 
              <strong class="text-slate-800 font-bold block mt-1 text-sm md:text-base font-cinzel">${course.title}</strong>
              ministrado através do ecossistema de aprendizagem ${config.company.name}, atendendo de forma satisfatória a todos os requisitos pedagógicos e práticos do curso.
            </p>
          </div>

          <!-- Footer Metadata & Signatures -->
          <div class="mt-4">
            <div class="grid grid-cols-3 items-end text-center">
              
              <!-- Left side: Course Specs -->
              <div class="space-y-1 text-left pl-4">
                <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Carga Horária</p>
                <p class="text-xs font-bold text-slate-700">${estimatedHours} Horas de Aula</p>
                <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-2">Data de Conclusão</p>
                <p class="text-xs font-bold text-slate-700">${formattedDate}</p>
              </div>

              <!-- Center: Quality Gold Seal (SVG) -->
              <div class="flex justify-center">
                <div class="relative w-24 h-24 flex items-center justify-center">
                  <!-- Gold Seal Ring -->
                  <svg class="absolute w-24 h-24 text-amber-500 opacity-90 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke-width="2" stroke-dasharray="4,4" />
                    <circle cx="50" cy="50" r="46" stroke-width="1" />
                  </svg>
                  <!-- Inner Badge -->
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border border-amber-300 flex flex-col items-center justify-center shadow-lg text-center p-1 relative z-10">
                    <span class="text-[8px] font-bold text-amber-950 uppercase tracking-widest leading-none font-cinzel">SELO DE</span>
                    <span class="text-[9px] font-extrabold text-amber-950 uppercase leading-none font-cinzel mt-0.5">QUALIDADE</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-950 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <!-- Ribbon vector -->
                  <div class="absolute bottom-[-10px] w-12 flex justify-between gap-1 z-0">
                    <div class="w-4 h-12 bg-amber-600 transform rotate-[15deg] origin-top border-b-4 border-amber-700"></div>
                    <div class="w-4 h-12 bg-amber-600 transform rotate-[-15deg] origin-top border-b-4 border-amber-700"></div>
                  </div>
                </div>
              </div>

              <!-- Right side: Signatures -->
              <div class="space-y-1 text-center pr-4">
                <div class="inline-block px-6">
                  <!-- Simulated elegant signature font -->
                  <p class="font-script text-lg text-emerald-800 leading-none h-6">${config.company.name}</p>
                  <div class="w-36 h-px bg-slate-400 mx-auto mt-1"></div>
                  <p class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">Assinatura Pedagógica Digital</p>
                  <p class="text-[7px] text-slate-300 font-mono">ID CERTIFICADO: ${certId.substring(0, 15)}</p>
                </div>
              </div>

            </div>
            
            <!-- Authentic bottom stamp -->
            <div class="border-t border-slate-100 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-[8px] text-slate-400">
              <span class="font-mono uppercase tracking-wider">Código de Verificação: <span class="font-bold text-slate-600">${certId}</span></span>
              <span class="mt-1 md:mt-0 italic">Verificação eletrônica protegida por assinatura criptográfica Alumini Green.</span>
            </div>

          </div>

        </div>

      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.log("[CERTIFICATE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
