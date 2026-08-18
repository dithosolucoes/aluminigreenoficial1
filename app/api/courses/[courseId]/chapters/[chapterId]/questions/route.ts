import { NextResponse } from 'next/server';

import { auth, syncCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Nome e foto agora vêm da tabela User (antes eram copiados na própria
 * pergunta, o que congelava o nome no momento do envio). A resposta da API
 * continua achatada em userName/userImage para não quebrar o componente.
 */
const flatten = (q: any) => ({
  id: q.id,
  userId: q.userId,
  userName: q.user?.name ?? 'Aluno',
  userImage: q.user?.imageUrl ?? null,
  content: q.content,
  createdAt: q.createdAt,
  answers: (q.answers ?? []).map((a: any) => ({
    id: a.id,
    userId: a.userId,
    userName: a.user?.name ?? 'Suporte',
    userImage: a.user?.imageUrl ?? null,
    content: a.content,
    isTeacher: a.isTeacher,
    createdAt: a.createdAt,
  })),
});

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const questions = await db.question.findMany({
      where: { chapterId: params.chapterId },
      include: {
        user: true,
        answers: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(questions.map(flatten));
  } catch (error) {
    console.log('[QUESTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { content } = await req.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return new NextResponse('Content is required', { status: 400 });
    }

    // Garante a linha em User antes de gravar (chave estrangeira).
    await syncCurrentUser();

    const question = await db.question.create({
      data: {
        userId,
        content: content.trim(),
        chapterId: params.chapterId,
      },
      include: { user: true, answers: { include: { user: true } } },
    });

    return NextResponse.json(flatten(question));
  } catch (error) {
    console.log('[QUESTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
