import { db } from '@/lib/db';
import { auth, isTeacher, syncCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title } = await req.json();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Course.userId tem chave estrangeira para User. Com o Clerk o usuário
    // nasce fora do banco, então garantimos a linha antes de gravar.
    await syncCurrentUser();

    const course = await db.course.create({
      data: {
        userId,
        title,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log('[Courses]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
