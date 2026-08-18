import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/** Consultado pela tela do Pix enquanto espera o webhook confirmar. */
export async function GET(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  const { userId } = auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const purchase = await db.purchase.findUnique({
    where: { id: params.purchaseId },
    select: { userId: true, status: true },
  });

  if (!purchase) return new NextResponse('Not Found', { status: 404 });
  if (purchase.userId !== userId) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.json({ status: purchase.status });
}
