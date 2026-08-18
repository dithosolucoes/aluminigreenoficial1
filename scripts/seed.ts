/**
 * Popula o banco com dados de demonstração.
 *
 * Rode com:  npx tsx scripts/seed.ts
 *
 * Idempotente — pode rodar quantas vezes quiser. Cria:
 *  · os 3 usuários de teste (mesmos IDs de lib/auth/mock-users.ts)
 *  · as categorias
 *  · 4 cursos publicados com aulas e vídeos simulados
 *  · matrículas: Ana comprou 2 cursos e tem progresso; Bruno não comprou nada
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const TEACHER_ID = 'mock_teacher_admin';
const ANA_ID = 'mock_student_ana';
const BRUNO_ID = 'mock_student_bruno';

const DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
];

const CATEGORIES = [
  'Inovação',
  'Sustentabilidade & ESG',
  'Gestão Empresarial',
  'Empreendedorismo',
  'Liderança & Soft Skills',
  'Tecnologia da Informação',
  'Ciências Ambientais',
  'Consultoria Estratégica',
];

const COURSES = [
  {
    title: 'ESG na Prática: do Discurso ao Resultado',
    category: 'Sustentabilidade & ESG',
    price: 597,
    description:
      'Entenda como critérios ambientais, sociais e de governança deixam de ser relatório e viram vantagem competitiva. Ao final você terá um diagnóstico ESG da sua própria empresa.',
    image:
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&q=80',
    chapters: [
      'O que é ESG e o que não é',
      'Os três pilares e como medir cada um',
      'Construindo a matriz de materialidade',
      'Relato e transparência sem greenwashing',
      'Diagnóstico ESG: exercício final',
    ],
  },
  {
    title: 'Inovação e Negócios Sustentáveis',
    category: 'Inovação',
    price: 497,
    description:
      'Metodologias de inovação aplicadas a modelos de negócio que crescem sem esgotar recursos. Da ideação ao protótipo validado.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    chapters: [
      'Por que inovar deixou de ser opcional',
      'Economia circular como modelo de negócio',
      'Ideação estruturada e seleção de ideias',
      'Prototipagem rápida e validação com o mercado',
    ],
  },
  {
    title: 'Gestão Empresarial para Pequenos Negócios',
    category: 'Gestão Empresarial',
    price: 397,
    description:
      'O básico bem feito: fluxo de caixa, precificação, indicadores e rotina de gestão para quem toca a empresa e não tem tempo a perder.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    chapters: [
      'Fluxo de caixa que você realmente mantém',
      'Precificação: como parar de perder dinheiro',
      'Os cinco indicadores que importam',
      'Rotina de gestão semanal',
      'Quando e como contratar',
    ],
  },
  {
    title: 'Liderança e Times de Alta Performance',
    category: 'Liderança & Soft Skills',
    price: 447,
    description:
      'Como liderar sem microgerenciar. Comunicação, delegação, feedback e construção de confiança em times pequenos.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
    chapters: [
      'Do fazer ao liderar: a virada de chave',
      'Delegar sem perder o controle',
      'Feedback que muda comportamento',
      'Conversas difíceis',
    ],
  },
];

async function main() {
  console.log('Semeando o banco...\n');

  /* ---------------------------------------------------------------- */
  /* Usuários                                                          */
  /* ---------------------------------------------------------------- */
  const users = [
    {
      id: TEACHER_ID,
      email: 'contato@aluminigreen.org',
      name: 'Equipe Alumini Green',
      role: 'TEACHER' as const,
    },
    {
      id: ANA_ID,
      email: 'ana.souza@exemplo.com',
      name: 'Ana Souza',
      role: 'STUDENT' as const,
    },
    {
      id: BRUNO_ID,
      email: 'bruno.lima@exemplo.com',
      name: 'Bruno Lima',
      role: 'STUDENT' as const,
    },
  ];

  for (const u of users) {
    await db.user.upsert({ where: { id: u.id }, update: u, create: u });
  }
  console.log(`  ${users.length} usuários`);

  /* ---------------------------------------------------------------- */
  /* Categorias                                                        */
  /* ---------------------------------------------------------------- */
  for (const name of CATEGORIES) {
    await db.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`  ${CATEGORIES.length} categorias`);

  /* ---------------------------------------------------------------- */
  /* Cursos, aulas e vídeos                                            */
  /* ---------------------------------------------------------------- */
  const createdCourses: { id: string; title: string }[] = [];

  for (const c of COURSES) {
    const category = await db.category.findUnique({
      where: { name: c.category },
    });

    const existing = await db.course.findFirst({ where: { title: c.title } });

    const course = existing
      ? await db.course.update({
          where: { id: existing.id },
          data: {
            description: c.description,
            imageUrl: c.image,
            price: c.price,
            isPublished: true,
            categoryId: category?.id,
          },
        })
      : await db.course.create({
          data: {
            userId: TEACHER_ID,
            title: c.title,
            description: c.description,
            imageUrl: c.image,
            price: c.price,
            isPublished: true,
            categoryId: category?.id,
          },
        });

    createdCourses.push({ id: course.id, title: course.title });

    for (let i = 0; i < c.chapters.length; i++) {
      const title = c.chapters[i];
      const found = await db.chapter.findFirst({
        where: { courseId: course.id, position: i + 1 },
      });

      const chapter = found
        ? await db.chapter.update({
            where: { id: found.id },
            data: { title, isPublished: true, isFree: i === 0 },
          })
        : await db.chapter.create({
            data: {
              title,
              description: `<p>Nesta aula: <strong>${title}</strong>. Conteúdo de demonstração para validar a plataforma.</p>`,
              position: i + 1,
              isPublished: true,
              isFree: i === 0, // primeira aula sempre aberta como degustação
              courseId: course.id,
              videoUrl: DEMO_VIDEOS[i % DEMO_VIDEOS.length],
            },
          });

      await db.videoAsset.upsert({
        where: { chapterId: chapter.id },
        update: {},
        create: {
          chapterId: chapter.id,
          provider: 'MOCK',
          assetId: `mock_${chapter.id.slice(0, 8)}`,
          playbackId: DEMO_VIDEOS[i % DEMO_VIDEOS.length],
          libraryId: 'mock-library',
          status: 'READY',
        },
      });
    }

    console.log(`  curso: ${c.title} (${c.chapters.length} aulas)`);
  }

  /* ---------------------------------------------------------------- */
  /* Matrículas — Ana comprou dois cursos, Bruno nenhum                */
  /* ---------------------------------------------------------------- */
  for (const course of createdCourses.slice(0, 2)) {
    await db.purchase.upsert({
      where: { userId_courseId: { userId: ANA_ID, courseId: course.id } },
      update: { status: 'PAID', paidAt: new Date() },
      create: {
        userId: ANA_ID,
        courseId: course.id,
        status: 'PAID',
        provider: 'MOCK',
        method: 'CARD',
        amount: 597,
        installments: 3,
        paidAt: new Date(),
      },
    });
  }
  console.log('  Ana matriculada em 2 cursos');

  /* ---------------------------------------------------------------- */
  /* Progresso — Ana concluiu as 2 primeiras aulas do primeiro curso   */
  /* ---------------------------------------------------------------- */
  const firstCourse = createdCourses[0];
  const chapters = await db.chapter.findMany({
    where: { courseId: firstCourse.id },
    orderBy: { position: 'asc' },
    take: 2,
  });

  for (const ch of chapters) {
    await db.userProgress.upsert({
      where: { userId_chapterId: { userId: ANA_ID, chapterId: ch.id } },
      update: { isCompleted: true },
      create: { userId: ANA_ID, chapterId: ch.id, isCompleted: true },
    });
  }
  console.log('  Ana com progresso em 2 aulas');

  /* ---------------------------------------------------------------- */
  /* Uma dúvida já respondida, para a aba de perguntas não nascer vazia */
  /* ---------------------------------------------------------------- */
  const firstChapter = chapters[0];
  if (firstChapter) {
    const existingQ = await db.question.findFirst({
      where: { chapterId: firstChapter.id, userId: ANA_ID },
    });

    if (!existingQ) {
      const q = await db.question.create({
        data: {
          userId: ANA_ID,
          chapterId: firstChapter.id,
          content:
            'Essa metodologia funciona também para empresa de serviço, ou é mais voltada para indústria?',
        },
      });

      await db.answer.create({
        data: {
          userId: TEACHER_ID,
          questionId: q.id,
          isTeacher: true,
          content:
            'Ótima pergunta, Ana. Funciona nos dois casos — o que muda é onde estão os impactos. Em serviço o peso costuma ficar na cadeia de fornecedores e no social. Vemos isso em detalhe na aula 3.',
        },
      });
      console.log('  1 dúvida com resposta');
    }
  }

  console.log('\nPronto.');
}

main()
  .catch((e) => {
    console.error('Erro ao semear:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
