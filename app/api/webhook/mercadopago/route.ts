import { NextResponse } from 'next/server';

import { MOCK_MODE } from '@/lib/config';
import { confirmPayment } from '@/lib/payment';

/**
 * Webhook do Mercado Pago (Pix).
 *
 * O Mercado Pago avisa que "algo mudou" mas não manda o estado — é preciso
 * consultar o pagamento para saber se foi aprovado.
 */
export async function POST(req: Request) {
  if (MOCK_MODE) return new NextResponse(null, { status: 200 });

  try {
    const body = await req.json();
    const paymentId = body?.data?.id;

    if (!paymentId) return new NextResponse(null, { status: 200 });

    const { fetchPaymentStatus } = await import('@/lib/payment/mercadopago');
    const { externalId, paid } = await fetchPaymentStatus(String(paymentId));

    if (paid) await confirmPayment(externalId, true);

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.log('[MERCADOPAGO_WEBHOOK]', error);
    return new NextResponse(null, { status: 200 });
  }
}
