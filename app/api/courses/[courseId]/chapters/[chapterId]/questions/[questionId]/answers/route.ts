import { NextResponse } from 'next/server';

import { auth, isTeacher, syncCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: { courseId: string; chapterId: string; questionId: string };
  }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { content } = await req.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return new NextResponse('Content is required', { status: 400 });
    }

    await syncCurrentUser();

    const answer = await db.answer.create({
      data: {
        userId,
        content: content.trim(),
        isTeacher: isTeacher(userId),
        questionId: params.questionId,
      },
      include: { user: true },
    });

    return NextResponse.json({
      id: answer.id,
      userId: answer.userId,
      userName: answer.user?.name ?? 'Suporte',
      userImage: answer.user?.imageUrl ?? null,
      content: answer.content,
      isTeacher: answer.isTeacher,
      createdAt: answer.createdAt,
    });
  } catch (error) {
    console.log('[ANSWERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
