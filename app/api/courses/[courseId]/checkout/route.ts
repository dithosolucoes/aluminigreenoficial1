import { NextResponse } from 'next/server';

import { currentUser, syncCurrentUser } from '@/lib/auth';
import { createCheckout, hasAccess } from '@/lib/payment';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
    });
    if (!course) return new NextResponse('Not Found', { status: 404 });

    if (await hasAccess(user.id, params.courseId)) {
      return new NextResponse('Você já tem acesso a este curso', {
        status: 400,
      });
    }

    const body = await req.json().catch(() => ({}));
    const method = body?.method === 'PIX' ? 'PIX' : 'CARD';
    const installments = Number(body?.installments) || 1;

    await syncCurrentUser();

    // A compra nasce PENDING. Só o webhook do provedor promove para PAID —
    // é o mesmo caminho em modo simulado e em produção.
    const checkout = await createCheckout({
      userId: user.id,
      userEmail: user.email,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price ?? 0,
      method,
      installments,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.log('[COURSE_ID_CHECKOUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
