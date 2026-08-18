"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  ChevronRight, 
  Menu, 
  X, 
  MessageCircle, 
  Instagram, 
  Mail, 
  MapPin, 
  Phone, 
  Compass, 
  Award, 
  ShieldCheck, 
  Target, 
  Briefcase,
  Star,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle2,
  Calculator,
  HelpCircle,
  Clock,
  Sparkle
} from "lucide-react";

// Types for detailed interactive views
interface Trainer {
  name: string;
  role: string;
  image: string;
  bio: string;
  keyTopics: string[];
  experience: string;
  quote: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  category: "all" | "student" | "business";
}

interface CourseSyllabus {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  level: string;
  professor: string;
  modules: string[];
}

export const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [testimonialFilter, setTestimonialFilter] = useState<"all" | "student" | "business">("all");
  
  // Interactive ESG Quiz State
  const [quizStep, setQuizStep] = useState(0); // 0 = start, 1..4 = questions, 5 = results
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [diagnosticResult, setDiagnosticResult] = useState({
    title: "",
    level: "",
    description: "",
    nextSteps: [] as string[]
  });

  // ROI Calculator State
  const [teamSize, setTeamSize] = useState(15);
  const [avgHourlyCost, setAvgHourlyCost] = useState(80);

  // High-fidelity executive portraits with authentic backgrounds & professional biographies
  const trainers: Trainer[] = [
    { 
      name: "Marcus Nakagawa", 
      role: "Professor e Doutor em Sustentabilidade", 
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
      bio: "Professor titular de sustentabilidade e ESG na ESPM. É um dos principais pensadores de responsabilidade socioambiental do Brasil, palestrante TEDx e autor premiado com o Prêmio Jabuti.",
      keyTopics: ["ESG Aplicado a Negócios", "Economia Circular", "Investimento de Impacto", "Consumo Consciente"],
      experience: "Doutor em Sustentabilidade, Co-fundador da Abraps (Associação Brasileira dos Profissionais pelo Desenvolvimento Sustentável) e Conselheiro de Impacto de multinacionais.",
      quote: "Sustentabilidade não é uma tendência de marketing, é o modelo de negócios de sobrevivência para o século XXI."
    },
    { 
      name: "Wilson Ribeiro Linz", 
      role: "Consultor de Governança Corporativa", 
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
      bio: "Especialista sênior em estruturação de processos corporativos, auditoria de integridade e transição de governança familiar para gestão profissionalizada.",
      keyTopics: ["Governança Corporativa", "Gestão de Riscos", "Integridade Empresarial", "Compliance"],
      experience: "Mais de 25 anos de experiência prática reestruturando diretorias, ex-diretor financeiro de holdings de infraestrutura e varejo.",
      quote: "Sem governança sólida e ética, nenhum projeto de sustentabilidade ou inovação consegue se manter de pé."
    },
    { 
      name: "Christie Bechara", 
      role: "Consultora e Facilitadora Organizacional", 
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      bio: "Facilitadora em metodologias ágeis de mudança organizacional e desenvolvimento de cultura orientada a resultados socioambientais sustentáveis.",
      keyTopics: ["Cultura Organizacional Ágil", "Liderança Consciente", "Gestão de Mudanças", "Facilitação de Conflitos"],
      experience: "Consultora internacional de liderança de pessoas, tendo liderado transformações de cultura em mais de 40 grandes corporações brasileiras.",
      quote: "Empresas não mudam sozinhas; pessoas mudam. O verdadeiro ESG começa na transformação profunda do comportamento da liderança."
    },
    { 
      name: "Álvaro Novaes", 
      role: "Especialista em Coaching Digital e Inovação", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      bio: "Consultor em inovação aberta, growth hacking corporativo e aceleração de negócios escaláveis através de canais de ecossistemas digitais.",
      keyTopics: ["Coaching Digital", "Sistemas de Inovação Aberta", "Growth Estratégico", "Venture Building"],
      experience: "Mentor em programas nacionais de aceleração de startups, especializado em desenhar canais digitais de alta performance.",
      quote: "Inovação é velocidade de aprendizado. Liderar o mercado significa estruturar processos ágeis de teste, falha e escala."
    },
    { 
      name: "Paulo Pinho", 
      role: "Professor e Consultor de Finanças Corporativas", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
      bio: "Especialista em finanças verdes, captação de venture capital de impacto e engenharia de viabilidade econômico-financeira para novos produtos sustentáveis.",
      keyTopics: ["Finanças Verdes & Sustentáveis", "Viabilidade de Projetos", "Valuation", "Métricas Corporativas ESG"],
      experience: "Economista com mestrado em finanças, professor de MBA, assessor na estruturação de rodadas de captação de investimento socioambiental.",
      quote: "O fluxo de investimentos globais migrou de vez para negócios com responsabilidade. Sustentabilidade hoje é liquidez."
    },
    { 
      name: "Rafael Meschiatti", 
      role: "Consultor de Novos Negócios", 
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=400&auto=format&fit=crop",
      bio: "Investidor-anjo e mentor de negócios verdes. Atua na ponte entre grandes corporações industriais e cleantechs para reduzir passivos ambientais reais.",
      keyTopics: ["Desenvolvimento de Cleantechs", "Estratégias de Descarbonização", "Parcerias Estratégicas", "Corporate Venturing"],
      experience: "Especialista em transição energética corporativa, mestre em administração e consultor de ESG em cadeias logísticas pesadas.",
      quote: "O maior gargalo das metas socioambientais é o distanciamento da tecnologia. As startups têm a chave para acelerar as soluções."
    },
    { 
      name: "Júlio Cesar P. da Silva", 
      role: "Professor e Consultor de Qualidade Industrial", 
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
      bio: "Consultor líder de melhoria contínua, especialista em metodologias ágeis de produção lean e auditor líder de certificações de sustentabilidade.",
      keyTopics: ["Manufatura Reversa & Lean", "Gestão de Resíduos Industriais", "Auditoria Ambiental ISO", "Melhoria de Processos"],
      experience: "Mestre em administração, auditor líder ISO 14001, com atuação em projetos de eficiência produtiva em grandes indústrias petroquímicas.",
      quote: "Eliminar desperdícios industriais é sinônimo direto de rentabilidade financeira e proteção ecológica ativa."
    },
    { 
      name: "Mozart Fernandes", 
      role: "Master Coach Business & Alta Direção", 
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
      bio: "Mentor especializado no alinhamento de propósito pessoal e diretrizes de governança para fundadores e herdeiros de grupos familiares em fase de internacionalização.",
      keyTopics: ["Executive Coaching", "Alinhamento de Conselhos", "Liderança Sistêmica", "Sucessão de Gestão"],
      experience: "Mais de 300 executivos de alto nível desenvolvidos individualmente, coach credenciado por institutos mundiais de prestígio.",
      quote: "Se você deseja transformar o ecossistema externo de um negócio, você precisa primeiro expandir a mentalidade de quem o dirige."
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Beatriz Nolasco",
      role: "Aluna de Gestão",
      category: "student",
      text: "Sou aluna e parabenizo a metodologia usada. Também, toda a seleção de professores e profissionais que fazem parte dessa equipe. Sensacional. Indico demais o investimento nos cursos."
    },
    {
      name: "Victoria Albuquerque",
      role: "Aluna de ESG",
      category: "student",
      text: "Com as aulas eu aprendi detalhes sobre ESG e seu impacto no mundo, as aulas são ministradas de forma que o aluno compreende da melhor maneira possível e os professores são excelentes na abordagem dos temas."
    },
    {
      name: "Bruno Lima",
      role: "Empresário",
      category: "business",
      text: "A Aluminigreen realmente me surpreendeu! Os cursos online são completos e focados em práticas do mercado atual. Consegui aplicar o conhecimento na minha empresa desde o primeiro módulo e já vejo os resultados. Recomendo para quem busca inovação com propósito!"
    },
    {
      name: "Carla Minez",
      role: "Gestora Comercial",
      category: "business",
      text: "A equipe da Aluminigreen me ajudou a reposicionar meu negócio com soluções inovadoras e sustentáveis. Com a consultoria, consegui direcionar melhor meus recursos e conectar minha marca com os valores que realmente importam para o público. Foi um divisor de águas!"
    },
    {
      name: "Lucas Oliveira",
      role: "Empreendedor",
      category: "student",
      text: "Fiz o curso 'Inovação e negócios sustentáveis' e foi um divisor de águas para mim, aprendi muito e já estou colocando em prática! Foi super importante para meu desenvolvimento. Amei a experiência, indico muito!"
    },
    {
      name: "João Paulo",
      role: "Diretor de Operações",
      category: "business",
      text: "Com a rotina corrida, sempre achei difícil me atualizar. Mas os cursos da Aluminigreen são perfeitos para quem precisa de flexibilidade! Além de práticos, são aplicáveis no dia a dia, e o suporte dos especialistas é excelente. Estou alcançando novos patamares na minha carreira!"
    }
  ];

  // Highly-structured courses with curriculum detail for interactive tabs
  const interactiveCourses: CourseSyllabus[] = [
    {
      id: "esg",
      title: "ESG e Sustentabilidade Corporativa",
      subtitle: "Governança prática e metas socioambientais aplicadas ao mercado real",
      description: "Aprenda a estruturar o comitê, elaborar o relatório de sustentabilidade corporativo sob padrões globais e auditar processos sob a lente das demandas de investidores modernos.",
      duration: "40 horas",
      level: "Executive / MBA",
      professor: "Prof. Dr. Marcus Nakagawa",
      modules: [
        "Módulo 1: Fundamentos históricos e evolução do Pacto Global da ONU",
        "Módulo 2: O Pilar Ambiental (E) – Pegada de Carbono, Água e Resíduos",
        "Módulo 3: O Pilar Social (S) – Direitos Humanos, Diversidade e Relações de Trabalho",
        "Módulo 4: O Pilar de Governança (G) – Ética, Transparência e Combate à Corrupção",
        "Módulo 5: Padrões de Relato de Sustentabilidade – GRI, SASB e TCFD"
      ]
    },
    {
      id: "innov",
      title: "Inovação Aberta e Práticas Ágeis",
      subtitle: "Como captar soluções externas e engajar startups para desafios de impacto",
      description: "Desenvolva habilidades de facilitação ágil, desenhe funis de aquisição de inteligência de startups e reduza o custo de P&D conectando-se ao ecossistema.",
      duration: "32 horas",
      level: "Profissional Avançado",
      professor: "Álvaro Novaes / Christie Bechara",
      modules: [
        "Módulo 1: O Paradigma da Inovação Aberta e Modelagem de Ecossistemas",
        "Módulo 2: Design Thinking Aplicado a Problemas Sócio-Ecológicos",
        "Módulo 3: Corporate Venture Capital e Estruturação de Programas de Startups",
        "Módulo 4: Facilitação de Equipes de Alta Performance sob Metodologias Ágeis",
        "Módulo 5: Casos de Sucesso em ESG-Techs Nacionais"
      ]
    },
    {
      id: "governance",
      title: "Governança Corporativa e Gestão de Riscos",
      subtitle: "Estruturação de conselhos éticos, compliance e preservação de marcas",
      description: "O alicerce administrativo indispensável. Descubra como alinhar os interesses de sócios, acionistas e colaboradores com foco em solidez operacional e mitigação de riscos de conformidade.",
      duration: "45 horas",
      level: "Conselheiros & Diretores",
      professor: "Wilson Ribeiro Linz / Paulo Pinho",
      modules: [
        "Módulo 1: Teoria do Agente e Princípios Fundamentais do IBGC",
        "Módulo 2: Estrutura, Papel e Composição de Conselhos de Administração",
        "Módulo 3: Matriz de Identificação de Riscos Corporativos e Prevenção de Crises",
        "Módulo 4: Compliance, Canais de Denúncia e Políticas de Transparência",
        "Módulo 5: Governança em Empresas Familiares e Sucessão Gerencial"
      ]
    }
  ];

  const [activeCourseId, setActiveCourseId] = useState("esg");
  const activeCourse = interactiveCourses.find(c => c.id === activeCourseId) || interactiveCourses[0];

  // Diagnostic Quiz Questions
  const quizQuestions = [
    {
      question: "Qual o nível de maturidade ESG atual da sua organização?",
      options: [
        { text: "Conformidade Mínima: Apenas evitamos problemas legais e multas trabalhistas.", score: 1 },
        { text: "Iniciativas Isoladas: Fazemos ações pontuais (doações, reciclagem), sem plano centralizado.", score: 2.5 },
        { text: "Planejamento Ativo: Possuímos comitê de sustentabilidade e metas de redução de carbono.", score: 4 },
        { text: "Liderança Integrada: ESG é o centro de inovação de novos produtos e novos negócios.", score: 5 }
      ]
    },
    {
      question: "Como sua empresa capacita seus líderes para as novas diretrizes verdes?",
      options: [
        { text: "Inexistente: Nossos líderes nunca receberam mentoria técnica sobre ESG ou Inovação Aberta.", score: 1 },
        { text: "Liderança Superior: Apenas a diretoria e conselho conhecem e discutem estas diretrizes.", score: 2.5 },
        { text: "Média Gerência: Temos gestores-chave qualificados que lideram projetos táticos.", score: 4 },
        { text: "Letramento Total: Toda a gerência, operação e parceiros possuem metas sustentáveis claras.", score: 5 }
      ]
    },
    {
      question: "Como a organização se conecta com inteligência externa para inovar?",
      options: [
        { text: "Inovação Fechada: Confiamos apenas em ideias internas, processos são lentos e burocráticos.", score: 1 },
        { text: "Fomento Ocasional: Participamos de hackathons ou eventos corporativos esporadicamente.", score: 2.5 },
        { text: "Parcerias de Valor: Co-desenvolvemos soluções com startups, universidades ou hubs.", score: 4 },
        { text: "Venture Building: Investimos ativamente ou incubamos novas tecnologias socioambientais.", score: 5 }
      ]
    },
    {
      question: "Como os dados de impacto ambiental e social de sua marca são mensurados?",
      options: [
        { text: "Não mensuramos: Não acompanhamos emissões de carbono, diversidade de equipe ou auditorias.", score: 1 },
        { text: "Planilhas Básicas: Controlamos apenas consumo interno de insumos (energia, água, resíduos).", score: 2.5 },
        { text: "Relatório de Sustentabilidade: Elaboramos relatórios periódicos estruturados de responsabilidade.", score: 4 },
        { text: "Dashboard em Tempo Real: Dados ESG integrados aos indicadores financeiros gerais da companhia.", score: 5 }
      ]
    }
  ];

  const startQuiz = () => {
    setQuizStep(1);
    setQuizAnswers([]);
  };

  const handleQuizAnswer = (score: number) => {
    const updatedAnswers = [...quizAnswers, score];
    setQuizAnswers(updatedAnswers);
    
    if (quizStep < quizQuestions.length) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate results
      const totalScore = updatedAnswers.reduce((a, b) => a + b, 0);
      const avgScore = totalScore / quizQuestions.length;
      setCalculatedScore(avgScore);
      
      // Determine profile
      if (avgScore < 2) {
        setDiagnosticResult({
          title: "Maturidade Incipiente / Reativa",
          level: "Nível 1",
          description: "Sua organização foca quase estritamente em atender às regulações fundamentais e evitar passivos judiciais. Não há alinhamento estratégico com as tendências de mercado. Há sério risco de obsolescência, fuga de talentos e bloqueio a novos investimentos.",
          nextSteps: [
            "Realizar letramento básico de ESG com a alta liderança.",
            "Diagnosticar os maiores desperdícios de energia e materiais.",
            "Formular um comitê interno de ética e governança mínima."
          ]
        });
      } else if (avgScore < 3.8) {
        setDiagnosticResult({
          title: "Atuação Tática / Em Transição",
          level: "Nível 2",
          description: "A empresa entende a importância da agenda ESG e de inovação e desenvolve iniciativas táticas em setores específicos, mas as ações continuam fragmentadas. Falta capacitação uniforme de liderança intermediária para que a cultura se estabeleça no dia a dia.",
          nextSteps: [
            "Capacitar gerentes operacionais com o curso de ESG e Sustentabilidade Corporativa da Alumini.",
            "Estabelecer indicadores estruturados de emissão de carbono e diversidade de equipe.",
            "Criar canais de inovação aberta para captar soluções prontas de startups de tecnologia verde."
          ]
        });
      } else {
        setDiagnosticResult({
          title: "Referência em Inovação Sustentável",
          level: "Nível 3",
          description: "Parabéns! Sua marca integra a sustentabilidade e metodologias ágeis em sua estratégia central. Suas práticas ambientais geram valor corporativo real, fidelização de alta qualidade e atração de investidores de impacto. O próximo passo é robustecer a governança.",
          nextSteps: [
            "Implementar auditoria sob padrões de certificação global (GRI, SASB).",
            "Estruturar programas de Corporate Venture Capital focados em Climate Techs.",
            "Promover seus conselheiros seniores para debater sucessão sustentável e gestão de riscos avançada."
          ]
        });
      }
      setQuizStep(5);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setCalculatedScore(0);
  };

  // Pre-filled WhatsApp message based on ESG diagnosis results
  const getWhatsAppQuizLink = () => {
    const formattedScore = calculatedScore.toFixed(1);
    const text = `Olá! Fiz o diagnóstico de maturidade ESG no site Alumini Green. Minha organização obteve a pontuação ${formattedScore}/5.0 (Classificação: ${diagnosticResult.title}). Gostaria de agendar uma mentoria estratégica gratuita com um consultor!`;
    return `https://api.whatsapp.com/send?phone=5585991237273&text=${encodeURIComponent(text)}`;
  };

  // Testimonial Filters
  const filteredTestimonials = testimonials.filter(t => 
    testimonialFilter === "all" ? true : t.category === testimonialFilter
  );

  // Dynamic calculations for the Corporate ROI Slider
  const calculatedBenefits = {
    wasteReduction: Math.round(teamSize * 1540),
    hoursSaved: Math.round(teamSize * 18.5),
    roiEstimate: Math.round(teamSize * avgHourlyCost * 14.2)
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#e5e7eb] font-sans selection:bg-[#10b981] selection:text-black overflow-x-hidden antialiased">
      
      {/* Background Decorative Matrix - Subtle, premium, non-glowing Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d1117_1px,transparent_1px),linear-gradient(to_bottom,#0d1117_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none z-0" />

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07080a]/90 border-b border-[#111827]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <NextLink href="/" className="flex items-center gap-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-extrabold tracking-tight leading-none text-white">
                Alumini <span className="text-emerald-400">Green</span>
              </span>
              <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
                Educação & ESG
              </span>
            </div>
          </NextLink>

          {/* Premium Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-x-10 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            <a href="#inicio" className="hover:text-[#10b981] transition-all py-1.5 relative group">
              Início
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] transition-all group-hover:w-full" />
            </a>
            <a href="#diagnostico" className="hover:text-[#10b981] transition-all py-1.5 relative group">
              Diagnóstico ESG
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] transition-all group-hover:w-full" />
            </a>
            <a href="#solucoes" className="hover:text-[#10b981] transition-all py-1.5 relative group">
              Soluções & Cursos
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] transition-all group-hover:w-full" />
            </a>
            <a href="#especialistas" className="hover:text-[#10b981] transition-all py-1.5 relative group">
              Especialistas
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] transition-all group-hover:w-full" />
            </a>
            <a href="#depoimentos" className="hover:text-[#10b981] transition-all py-1.5 relative group">
              Depoimentos
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] transition-all group-hover:w-full" />
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-x-5">
            <NextLink 
              href="/sign-in"
              className="text-xs uppercase tracking-widest text-[#9ca3af] hover:text-[#10b981] font-bold transition-all px-3 py-2"
            >
              Área do Aluno
            </NextLink>
            <a 
              href="https://api.whatsapp.com/send?phone=5585991237273&text=Ol%C3%A1%2C+gostaria+de+receber+atendimento%21"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#10b981]/40 hover:bg-[#10b981]/10 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all flex items-center gap-x-2 shadow-sm"
            >
              <MessageCircle className="h-4 w-4 text-[#10b981]" />
              Falar com Consultor
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#9ca3af] hover:text-[#10b981] transition-colors"
            aria-label="Menu"
            id="mobile-menu-btn"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-b border-[#111827] bg-[#07080a] px-5 pt-2 pb-8 space-y-4 shadow-2xl relative z-50 text-left"
            >
              <a 
                href="#inicio" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 rounded-lg text-sm font-semibold text-[#e5e7eb] hover:text-[#10b981]"
              >
                Início
              </a>
              <a 
                href="#diagnostico" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 rounded-lg text-sm font-semibold text-[#e5e7eb] hover:text-[#10b981]"
              >
                Diagnóstico ESG
              </a>
              <a 
                href="#solucoes" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 rounded-lg text-sm font-semibold text-[#e5e7eb] hover:text-[#10b981]"
              >
                Soluções & Cursos
              </a>
              <a 
                href="#especialistas" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 rounded-lg text-sm font-semibold text-[#e5e7eb] hover:text-[#10b981]"
              >
                Especialistas
              </a>
              <a 
                href="#depoimentos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 rounded-lg text-sm font-semibold text-[#e5e7eb] hover:text-[#10b981]"
              >
                Depoimentos
              </a>
              <div className="pt-4 border-t border-[#111827] flex flex-col gap-y-3">
                <NextLink 
                  href="/sign-in"
                  className="w-full text-center py-3 rounded-lg text-xs uppercase tracking-wider font-extrabold text-[#e5e7eb] hover:bg-[#0f141f] border border-[#111827] transition-all"
                >
                  Área do Aluno
                </NextLink>
                <a 
                  href="https://api.whatsapp.com/send?phone=5585991237273&text=Ol%C3%A1%2C+gostaria+de+receber+atendimento%21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-[#10b981] text-black font-extrabold py-3 rounded-lg text-xs uppercase tracking-wider shadow-lg hover:bg-[#0ea570] transition-all flex items-center justify-center gap-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar com Especialista
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section (High-Contrast, Clean, Dynamic) */}
      <section id="inicio" className="relative pt-20 pb-28 md:py-36 overflow-hidden bg-[#07080a]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" 
            alt="Corporate Tech Grid Background" 
            className="w-full h-full object-cover opacity-[0.06] filter grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-[#07080a]/90 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
              <div className="inline-flex items-center gap-x-2 bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-full">
                <Sparkle className="h-3.5 w-3.5 text-[#10b981]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#10b981]">
                  Gestão Estratégica & ESG de Elite
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                Lidere com <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#059669]">
                  Inovação Real
                </span> e Práticas Verdes.
              </h1>
              
              <p className="text-[#9ca3af] text-sm md:text-lg max-w-xl font-medium leading-relaxed">
                Capacite seus tomadores de decisão com doutores de referência acadêmica e especialistas de mercado nacional. Transforme metas sustentáveis em vantagem competitiva e relatórios sólidos.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md">
                <a 
                  href="#diagnostico"
                  className="bg-[#10b981] hover:bg-[#0ea570] text-black font-extrabold text-xs uppercase tracking-wider px-8 py-4.5 rounded-lg transition-all shadow-xl shadow-[#10b981]/10 hover:-translate-y-0.5 text-center flex items-center justify-center gap-x-2.5"
                >
                  <Calculator className="h-4 w-4" />
                  Iniciar Diagnóstico ESG
                </a>
                <a 
                  href="#solucoes"
                  className="border border-[#111827] hover:border-[#10b981]/40 hover:bg-[#10b981]/5 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4.5 rounded-lg transition-all text-center flex items-center justify-center gap-x-2"
                >
                  Conhecer Portfólio
                  <ArrowRight className="h-4 w-4 text-[#10b981]" />
                </a>
              </div>

              {/* Elite Statistics Bar */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-[#111827] max-w-lg">
                <div className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-white">100%</p>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-[#6b7280]">Online & In-Company</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-[#10b981]">08</p>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-[#6b7280]">Especialistas & Doutores</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-white">Nota 5</p>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-[#6b7280]">MEC e Mercado</p>
                </div>
              </div>
            </div>

            {/* Right Hero - Interactive Live ESG Indicator Grid */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-2xl bg-[#0b0c0f] border border-[#111827] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#10b981]/20 transition-all duration-300">
                
                {/* Minimal tech vector network lines inside */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="50" y1="50" x2="150" y2="150" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="150" y1="150" x2="350" y2="120" stroke="#10b981" strokeWidth="1" />
                  <line x1="350" y1="120" x2="280" y2="280" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="50" cy="50" r="3" fill="#10b981" />
                  <circle cx="150" cy="150" r="4" fill="#10b981" />
                  <circle cx="350" cy="120" r="3.5" fill="#10b981" />
                  <circle cx="280" cy="280" r="5" fill="#10b981" className="animate-ping" />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#10b981]">Performance Real-Time</span>
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9ca3af] bg-[#07080a] px-2 py-1 rounded border border-[#111827]">
                    Alumini-Metrics
                  </span>
                </div>

                <div className="my-auto py-6 space-y-4 relative z-10">
                  <div className="bg-[#07080a]/60 border border-[#111827] rounded-xl p-4 space-y-3.5">
                    <p className="text-[10px] uppercase tracking-widest font-black text-[#6b7280]">Indicador Global de Responsabilidade</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-4xl font-black text-white">89.4%</p>
                      <span className="text-xs text-[#10b981] font-bold flex items-center gap-x-1">
                        <TrendingUp className="h-3 w-3" /> +12.3%
                      </span>
                    </div>
                    
                    <div className="h-1.5 w-full bg-[#0d1117] rounded-full overflow-hidden">
                      <div className="h-full w-[89.4%] bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#07080a]/40 border border-[#111827]/80 rounded-xl p-3">
                      <p className="text-[8px] uppercase tracking-wider font-black text-[#6b7280]">Retenção de Talentos</p>
                      <p className="text-lg font-bold text-white mt-1">94.2%</p>
                    </div>
                    <div className="bg-[#07080a]/40 border border-[#111827]/80 rounded-xl p-3">
                      <p className="text-[8px] uppercase tracking-wider font-black text-[#6b7280]">Inovação Aberta</p>
                      <p className="text-lg font-bold text-[#10b981] mt-1">+38% ROI</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-[#6b7280] relative z-10 border-t border-[#111827]/60 pt-3">
                  <span>Maturidade Estratégica</span>
                  <span>ESG Score: A+</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. ESG & Innovation Readiness Diagnostics (interactive surprise module) */}
      <section id="diagnostico" className="py-24 bg-[#050608] border-y border-[#111827]/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          
          <div className="text-center space-y-3 mb-14">
            <span className="inline-block text-[9px] font-black tracking-[0.25em] text-[#10b981] uppercase bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
              Ferramenta Exclusiva
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Sua marca está realmente preparada?
            </h2>
            <p className="text-[#9ca3af] text-sm md:text-base max-w-xl mx-auto">
              Responda a 4 perguntas desenvolvidas por nossos consultores e descubra o diagnóstico rápido de maturidade ESG e inovação de sua empresa.
            </p>
          </div>

          {/* Interactive Quiz Wrapper */}
          <div className="bg-[#0b0c0f] border border-[#111827] rounded-2xl p-6 md:p-10 shadow-2xl relative">
            
            <AnimatePresence mode="wait">
              {quizStep === 0 && (
                <motion.div 
                  key="quiz-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-6 py-4"
                >
                  <div className="h-14 w-14 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mx-auto text-[#10b981]">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Diagnóstico Rápido de Maturidade</h3>
                    <p className="text-xs md:text-sm text-[#9ca3af] max-w-md mx-auto leading-relaxed">
                      Leva menos de 2 minutos. Obtenha recomendações imediatas e possibilite agendamento direto de feedback com nossos consultores.
                    </p>
                  </div>
                  <button
                    onClick={startQuiz}
                    className="bg-[#10b981] hover:bg-[#0ea570] text-black text-xs uppercase tracking-wider font-extrabold px-8 py-4 rounded-lg transition-all inline-flex items-center gap-x-2"
                  >
                    Iniciar Avaliação Gratuita
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {quizStep >= 1 && quizStep <= quizQuestions.length && (
                <motion.div 
                  key={`question-${quizStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-left"
                >
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-xs font-bold text-[#6b7280]">
                    <span>PERGUNTA {quizStep} DE {quizQuestions.length}</span>
                    <span>{Math.round((quizStep / quizQuestions.length) * 100)}% COMPLETO</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0d1117] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10b981] transition-all duration-300" 
                      style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                    {quizQuestions[quizStep - 1].question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3.5 pt-2">
                    {quizQuestions[quizStep - 1].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(option.score)}
                        className="w-full text-left p-4.5 rounded-xl border border-[#111827] bg-[#07080a] hover:border-[#10b981]/50 hover:bg-[#10b981]/5 text-xs md:text-sm font-semibold text-[#9ca3af] hover:text-white transition-all flex items-start gap-x-3 group"
                      >
                        <span className="h-5 w-5 rounded-full border border-[#111827] bg-[#0d1117] flex items-center justify-center text-[10px] font-black group-hover:border-[#10b981] group-hover:text-black group-hover:bg-[#10b981] shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{option.text}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {quizStep === 5 && (
                <motion.div 
                  key="quiz-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8 text-left"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#111827] pb-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-black text-[#10b981]">Maturidade Calculada</span>
                      <h3 className="text-2xl font-black text-white">{diagnosticResult.title}</h3>
                      <p className="text-xs text-[#9ca3af]">Média de Maturidade: <span className="text-white font-bold">{calculatedScore.toFixed(1)} / 5.0</span></p>
                    </div>

                    {/* Circular Score Gauge */}
                    <div className="flex items-center gap-x-4">
                      <div className="relative h-20 w-20 flex items-center justify-center">
                        <svg className="absolute transform -rotate-90 h-20 w-20">
                          <circle cx="40" cy="40" r="34" stroke="#0d1117" strokeWidth="6" fill="transparent" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            stroke="#10b981" 
                            strokeWidth="6" 
                            fill="transparent" 
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - calculatedScore / 5)}`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="text-lg font-black text-white">{(calculatedScore * 20).toFixed(0)}%</span>
                      </div>
                      <div className="text-xs">
                        <p className="font-extrabold text-[#10b981] uppercase">{diagnosticResult.level}</p>
                        <p className="text-[#6b7280] font-semibold">Gargalo Identificado</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-black text-white">Análise Detalhada</h4>
                    <p className="text-xs md:text-sm text-[#9ca3af] leading-relaxed font-medium bg-[#07080a] p-4.5 rounded-xl border border-[#111827]">
                      {diagnosticResult.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-black text-white">Próximos Passos Recomendados</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {diagnosticResult.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-x-3 text-xs md:text-sm font-semibold text-[#e5e7eb] bg-[#07080a]/50 p-4.5 rounded-xl border border-[#111827]">
                          <CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WhatsApp Pre-filled & CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#111827] justify-between items-center">
                    <button
                      onClick={resetQuiz}
                      className="text-xs text-[#9ca3af] hover:text-white font-extrabold uppercase tracking-wider py-3"
                    >
                      Refazer Diagnóstico
                    </button>
                    <a
                      href={getWhatsAppQuizLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#10b981] hover:bg-[#0ea570] text-black text-xs uppercase tracking-wider font-extrabold px-8 py-4 rounded-lg transition-all inline-flex items-center gap-x-2.5 shadow-xl shadow-[#10b981]/10 text-center"
                    >
                      <MessageCircle className="h-4.5 w-4.5" />
                      Agendar Mentoria Estratégica Grátis
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* 4. Curriculum & Solutions Explorer (Interactive Tabbed Bento Grid) */}
      <section id="solucoes" className="py-24 bg-[#07080a] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-16 md:mb-20">
            <span className="inline-block text-[9px] font-black tracking-[0.25em] text-[#10b981] uppercase bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
              Cursos e Projetos Ativos
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Portfólio Avançado de Educação
            </h2>
            <p className="text-[#9ca3af] text-sm md:text-base max-w-xl mx-auto">
              Conheça as formações e metodologias exclusivas que alinham rigor técnico e eficácia real no mercado corporativo.
            </p>
          </div>

          {/* Interactive Custom Domain Tabs */}
          <div className="flex justify-center border-b border-[#111827] max-w-3xl mx-auto mb-12">
            <div className="flex space-x-1 md:space-x-4">
              {interactiveCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`px-4 py-4 text-xs md:text-sm font-bold tracking-tight uppercase transition-all relative ${
                    activeCourseId === course.id 
                      ? "text-[#10b981]" 
                      : "text-[#6b7280] hover:text-white"
                  }`}
                >
                  {course.id === "esg" ? "Sustentabilidade ESG" : course.id === "innov" ? "Inovação Aberta" : "Governança & Riscos"}
                  {activeCourseId === course.id && (
                    <motion.div 
                      layoutId="activeCourseTabLine"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#10b981]" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bento-style detailed layout of the active Course */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCourseId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
            >
              {/* Left major block */}
              <div className="lg:col-span-7 bg-[#0b0c0f] border border-[#111827] p-6 md:p-8 rounded-2xl space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#10b981]/15 text-[#10b981] px-2.5 py-1 rounded">
                    {activeCourse.level}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#111827] text-[#9ca3af] px-2.5 py-1 rounded flex items-center gap-x-1">
                    <Clock className="h-3 w-3" /> {activeCourse.duration}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-black text-white">{activeCourse.title}</h3>
                  <p className="text-xs md:text-sm font-bold text-[#10b981]">{activeCourse.subtitle}</p>
                </div>

                <p className="text-xs md:text-sm text-[#9ca3af] leading-relaxed">
                  {activeCourse.description}
                </p>

                {/* Micro Syllabus Syllabus Accordion */}
                <div className="space-y-2.5 border-t border-[#111827]/80 pt-6">
                  <p className="text-[10px] uppercase tracking-widest font-black text-[#6b7280] mb-3">Conteúdo Programático Resumido</p>
                  <div className="space-y-2">
                    {activeCourse.modules.map((module, mIdx) => (
                      <div 
                        key={mIdx}
                        className="p-3.5 bg-[#07080a] border border-[#111827] rounded-lg text-xs md:text-sm font-semibold text-[#9ca3af] hover:text-white flex items-center gap-x-3 transition-colors"
                      >
                        <span className="h-5 w-5 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[10px] text-[#10b981] font-black shrink-0">
                          {mIdx + 1}
                        </span>
                        <span>{module}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side widgets block */}
              <div className="lg:col-span-5 space-y-6">
                {/* Professor assigned profile widget */}
                <div className="bg-[#0b0c0f] border border-[#111827] p-6 rounded-2xl space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-[#6b7280]">Docente Principal</p>
                  
                  {/* Find teacher details inside trainers to render correct visual card */}
                  {(() => {
                    const matchedProf = trainers.find(t => t.name.includes(activeCourse.professor.split(" ")[2] || "Marcus")) || trainers[0];
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-x-4">
                          <img 
                            src={matchedProf.image} 
                            alt={matchedProf.name} 
                            className="h-14 w-14 rounded-full object-cover grayscale brightness-110 border border-[#111827]"
                          />
                          <div>
                            <h4 className="text-sm font-black text-white">{matchedProf.name}</h4>
                            <p className="text-[10px] text-[#10b981] font-bold">{matchedProf.role}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#9ca3af] leading-relaxed italic">
                          &ldquo;{matchedProf.bio}&rdquo;
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Conversion trigger widget */}
                <div className="bg-gradient-to-br from-[#0c131a] to-[#040608] border border-[#111827] p-6 rounded-2xl space-y-5 text-center">
                  <p className="text-[10px] uppercase tracking-widest font-black text-[#10b981] animate-pulse">Sua empresa precisa de In-Company?</p>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    Personalizamos todo o plano de estudos, cronograma e estudos de caso para a realidade industrial ou comercial de sua companhia.
                  </p>
                  <a
                    href="https://api.whatsapp.com/send?phone=5585991237273&text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+os+programas+corporativos+in-company%21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#10b981] hover:bg-[#0ea570] text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-lg transition-all inline-flex items-center justify-center gap-x-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    Solicitar Proposta In-Company
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* 5. Expert Trainers/Docência Section with Dynamic Drawer Detail popup */}
      <section id="especialistas" className="py-24 bg-[#050608] border-y border-[#111827]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center space-y-3 mb-16 md:mb-20">
            <span className="inline-block text-[9px] font-black tracking-[0.25em] text-[#10b981] uppercase bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
              Corpo Docente & Especialistas
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Os especialistas por trás da sua formação
            </h2>
            <p className="text-[#9ca3af] text-sm md:text-base max-w-xl mx-auto">
              Professores renomados e autores premiados com profunda inserção no ecossistema de sustentabilidade e grandes conselhos do país.
            </p>
          </div>

          {/* Clean Academic Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 text-left">
            {trainers.map((trainer, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedTrainer(trainer)}
                className="group bg-[#0b0c0f] border border-[#111827] rounded-xl overflow-hidden hover:border-[#10b981]/40 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Profile headshot container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#07080a]">
                  <img 
                    src={trainer.image} 
                    alt={trainer.name} 
                    className="w-full h-full object-cover grayscale contrast-110 brightness-[0.85] group-hover:grayscale-0 group-hover:brightness-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0f] via-transparent to-transparent" />
                  
                  {/* Expand icon on hover */}
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#07080a]/85 border border-[#111827] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="h-4 w-4 text-[#10b981]" />
                  </div>
                </div>

                <div className="p-4 space-y-1 bg-[#0b0c0f] relative z-10">
                  <h3 className="text-sm md:text-base font-black text-[#10b981] group-hover:text-white transition-colors">
                    {trainer.name}
                  </h3>
                  <p className="text-[10px] text-[#9ca3af] font-medium tracking-tight">
                    {trainer.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Inspirational Jobs Quote Banner */}
          <div className="mt-20 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c131a] to-[#040608] p-8 md:p-14 text-center border border-[#111827] max-w-3xl mx-auto shadow-2xl">
            <span className="text-[#10b981] font-serif text-5xl leading-none opacity-40 select-none block mb-2">“</span>
            <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight max-w-xl mx-auto relative z-10 leading-relaxed italic text-white">
              A inovação é o que distingue um líder de um seguidor.
            </p>
            <span className="text-[9px] font-black tracking-[0.25em] text-[#10b981] uppercase block mt-5">
              Steve Jobs
            </span>
          </div>

        </div>
      </section>

      {/* 6. Professional Bio Slide-Over Drawer (Animated Framer-Motion Modal) */}
      <AnimatePresence>
        {selectedTrainer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainer(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Sidebar drawer panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className="relative w-full max-w-md h-full bg-[#0b0c0f] border-l border-[#111827] shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto text-left"
            >
              <div className="space-y-8">
                {/* Header Close button */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#10b981]">Ficha de Especialista</span>
                  <button 
                    onClick={() => setSelectedTrainer(null)}
                    className="p-1.5 rounded-lg border border-[#111827] text-[#9ca3af] hover:text-white hover:bg-[#0f141f]"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Profile summary */}
                <div className="flex items-center gap-x-4">
                  <img 
                    src={selectedTrainer.image} 
                    alt={selectedTrainer.name} 
                    className="h-16 w-16 rounded-full object-cover border border-[#111827] grayscale brightness-110"
                  />
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedTrainer.name}</h3>
                    <p className="text-xs text-[#10b981] font-bold leading-tight">{selectedTrainer.role}</p>
                  </div>
                </div>

                {/* Main bio details */}
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-[#6b7280]">Trajetória Acadêmica & Profissional</h4>
                    <p className="text-xs md:text-sm text-[#9ca3af] leading-relaxed font-medium">
                      {selectedTrainer.bio}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-[#6b7280]">Destaques de Atuação</h4>
                    <p className="text-xs text-[#e5e7eb] font-semibold">
                      {selectedTrainer.experience}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-[#6b7280]">Áreas de Mentoria & Estudo</h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedTrainer.keyTopics.map((topic, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="text-[10px] font-bold text-white bg-[#07080a] border border-[#111827] px-2.5 py-1 rounded-md"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Quote box */}
                <div className="bg-[#07080a] border border-[#111827] p-4.5 rounded-xl border-l-[3px] border-l-[#10b981]">
                  <p className="text-xs md:text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{selectedTrainer.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-[#111827]/60 mt-8">
                <a
                  href={`https://api.whatsapp.com/send?phone=5585991237273&text=Olá! Gostaria de tirar dúvidas com o consultor sobre o programa de consultoria ou cursos ministrados por ${encodeURIComponent(selectedTrainer.name)}!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#10b981] hover:bg-[#0ea570] text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-lg transition-all text-center flex items-center justify-center gap-x-2 shadow-lg"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  Agendar Mentoria com Especialista
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Interactive Corporate Training Calculator / Value Modeler (Surprise UX feature) */}
      <section className="py-24 bg-[#07080a] relative">
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-left">
          <div className="bg-[#0b0c0f] border border-[#111827] rounded-2xl p-6 md:p-10 shadow-2xl">
            
            <div className="border-b border-[#111827] pb-6 mb-8">
              <span className="text-[9px] uppercase tracking-widest font-black text-[#10b981] block mb-1">Simulador In-Company</span>
              <h3 className="text-xl md:text-2xl font-black text-white">Estime o Impacto Operacional</h3>
              <p className="text-xs md:text-sm text-[#9ca3af] mt-1">
                Ajuste os parâmetros abaixo com base no número de tomadores de decisão ou gestores a serem capacitados na sua corporação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Sliders container */}
              <div className="space-y-6">
                {/* Team Size Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-white">Líderes a Capacitar</label>
                    <span className="text-[#10b981] font-black text-lg">{teamSize} gestores</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="150" 
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full accent-[#10b981] h-1.5 bg-[#0d1117] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6b7280] font-bold">
                    <span>Mín: 5</span>
                    <span>Máx: 150</span>
                  </div>
                </div>

                {/* Avg Cost Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-white">Custo Médio da Hora de Liderança</label>
                    <span className="text-[#10b981] font-black text-lg">R$ {avgHourlyCost}/hora</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="300" 
                    value={avgHourlyCost}
                    onChange={(e) => setAvgHourlyCost(Number(e.target.value))}
                    className="w-full accent-[#10b981] h-1.5 bg-[#0d1117] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6b7280] font-bold">
                    <span>R$ 30/h</span>
                    <span>R$ 300/h</span>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs Dashboard */}
              <div className="bg-[#07080a] border border-[#111827] p-6 rounded-xl space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#6b7280]">Retorno Estimado de Performance</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-[#111827] pb-2">
                    <span className="text-[#9ca3af] font-semibold">Minimização de Desperdícios:</span>
                    <span className="text-white font-extrabold">R$ {calculatedBenefits.wasteReduction.toLocaleString("pt-BR")} /ano</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-[#111827] pb-2">
                    <span className="text-[#9ca3af] font-semibold">Horas Salvas por Processo Ágil:</span>
                    <span className="text-white font-extrabold">{calculatedBenefits.hoursSaved.toLocaleString("pt-BR")} horas/ano</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[#10b981] font-black uppercase tracking-wider">Potencial de ROI Estimado:</span>
                    <span className="text-[#10b981] font-black text-base">R$ {calculatedBenefits.roiEstimate.toLocaleString("pt-BR")} /ano</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=5585991237273&text=Olá! Simulei o retorno corporativo no site Alumini Green para um time de ${teamSize} líderes. Gostaria de solicitar um orçamento formal customizado!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-[#10b981]/10 hover:bg-[#10b981] text-[#10b981] hover:text-black border border-[#10b981]/30 font-extrabold text-[10px] uppercase tracking-wider py-3.5 rounded-lg transition-all flex items-center justify-center gap-x-2"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    Solicitar Orçamento de Escala
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 8. Testimonials Section (Filterable Showcase) */}
      <section id="depoimentos" className="py-24 bg-[#050608] border-y border-[#111827]/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-12 md:mb-16">
            <span className="inline-block text-[9px] font-black tracking-[0.25em] text-[#10b981] uppercase bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
              Histórias de Sucesso
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              A palavra de quem viveu a experiência
            </h2>
            <p className="text-[#9ca3af] text-sm md:text-base max-w-xl mx-auto">
              Nossos alunos e líderes de negócios contam os resultados gerados após a imersão com nossos consultores e docentes.
            </p>
          </div>

          {/* Dynamic Filter Controls */}
          <div className="flex justify-center gap-x-2 md:gap-x-4 mb-10 text-xs font-bold uppercase tracking-wider">
            {(["all", "student", "business"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTestimonialFilter(filter)}
                className={`px-4 py-2.5 rounded-full border transition-all ${
                  testimonialFilter === filter 
                    ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30" 
                    : "border-[#111827] text-[#6b7280] hover:text-[#e5e7eb] hover:bg-[#0b0c0f]"
                }`}
              >
                {filter === "all" ? "Todos" : filter === "student" ? "Alunos Cursos" : "Empresas Consultoria"}
              </button>
            ))}
          </div>

          {/* Testimonial Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <AnimatePresence>
              {filteredTestimonials.map((testi, idx) => (
                <motion.div 
                  key={testi.name}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#0b0c0f] border border-[#111827] rounded-xl p-6 hover:border-[#10b981]/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-x-0.5 text-[#10b981]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-[#9ca3af] font-medium leading-relaxed italic">
                      &ldquo;{testi.text}&rdquo;
                    </p>
                  </div>
                  
                  {/* Author footer */}
                  <div className="mt-6 pt-4 border-t border-[#111827]/60 flex items-center gap-x-3">
                    <div className="h-8 w-8 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[11px] font-black text-[#10b981]">
                      {testi.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{testi.name}</h4>
                      <p className="text-[10px] text-[#6b7280] font-semibold">{testi.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 9. Premium Conversion Banner */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c141c] via-[#05080c] to-[#040608] p-8 md:p-16 text-center shadow-2xl border border-[#111827]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d1117_1px,transparent_1px),linear-gradient(to_bottom,#0d1117_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-[0.15]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-none">
              Inicie a sua jornada de <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#10b981]">
                Liderança & Impacto.
              </span>
            </h2>
            <p className="text-[#9ca3af] text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
              Dê o passo seguinte para qualificar o seu conselho e aplicar as melhores práticas socioambientais de crescimento sustentável.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-md mx-auto">
              <NextLink 
                href="/sign-in"
                className="bg-white hover:bg-slate-200 text-black font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-lg transition-all text-center shadow-lg"
              >
                Entrar na Plataforma
              </NextLink>
              <a 
                href="https://api.whatsapp.com/send?phone=5585991237273&text=Ol%C3%A1%2C+gostaria+de+receber+atendimento%21"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#10b981]/50 hover:bg-[#10b981]/10 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-lg transition-all text-center flex items-center justify-center gap-x-2"
              >
                Falar com Especialista
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Institutional Footer */}
      <footer className="bg-[#040608] text-[#9ca3af] pt-16 pb-12 border-t border-[#111827]/80 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-y-12 lg:gap-x-12 pb-12 border-b border-[#111827]/40">
          
          {/* Logo & description block */}
          <div className="md:col-span-5 space-y-5">
            <NextLink href="/" className="flex items-center gap-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20">
                <GraduationCap className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-extrabold tracking-tight leading-none text-white">
                  Alumini <span className="text-emerald-400">Green</span>
                </span>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
                  Educação & ESG
                </span>
              </div>
            </NextLink>
            <p className="text-xs md:text-sm text-[#9ca3af] font-medium leading-relaxed">
              O conceito educacional Alumini Green transcende o ensino convencional. Entregamos soluções integradas de letramento e consultoria especializada para enraizar sustentabilidade, governança íntegra e inovação nos maiores segmentos empresariais nacionais.
            </p>
          </div>

          {/* Quick links navigation */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">Navegação</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#6b7280]">
              <li><a href="#inicio" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#diagnostico" className="hover:text-white transition-colors">Diagnóstico ESG</a></li>
              <li><a href="#solucoes" className="hover:text-white transition-colors">Soluções & Cursos</a></li>
              <li><a href="#especialistas" className="hover:text-white transition-colors">Especialistas</a></li>
              <li><a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">Contato</h4>
            <ul className="space-y-3.5 text-xs font-semibold text-[#6b7280]">
              <li className="flex items-center gap-x-2.5">
                <Instagram className="h-4 w-4 text-[#10b981]" />
                <a href="https://www.instagram.com/aluminigreen/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  @aluminigreen
                </a>
              </li>
              <li className="flex items-center gap-x-2.5">
                <Phone className="h-4 w-4 text-[#10b981]" />
                <span className="text-white">(85) 99123-7273</span>
              </li>
              <li className="flex items-center gap-x-2.5">
                <Mail className="h-4 w-4 text-[#10b981]" />
                <a href="mailto:contato@aluminigreen.org" className="hover:text-white transition-colors">
                  contato@aluminigreen.org
                </a>
              </li>
              <li className="flex items-start gap-x-2.5">
                <MapPin className="h-4 w-4 text-[#10b981] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Avenida Deputado Paulino Rocha, nº 2548, Sala 02 - Boa Vista Castelão, Fortaleza – CE, CEP: 60.867-585
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom footer legal and copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-y-4 text-xs font-semibold text-[#6b7280]">
          <p>
            Copyright &copy; 2026 &ndash; Aluminigreen Todos os Direitos Reservados
          </p>
          <div className="flex gap-x-4">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Políticas de Privacidade</a>
          </div>
        </div>
      </footer>

      {/* Floating help triggers */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        <div className="bg-[#0b0c0f] border border-[#111827] text-[10px] font-extrabold uppercase tracking-wider text-white px-3 py-1.5 rounded-lg shadow-xl mr-3 pointer-events-none hidden sm:block">
          Suporte Direto
        </div>
        <a 
          href="https://api.whatsapp.com/send?phone=5585991237273&text=Ol%C3%A1%2C+gostaria+de+receber+atendimento%21"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-14 w-14 rounded-full bg-[#10b981] hover:bg-[#0ea570] text-black shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
          id="floating-whatsapp-btn"
        >
          <MessageCircle className="h-6 w-6 text-black fill-current animate-pulse" />
        </a>
      </div>

    </div>
  );
};