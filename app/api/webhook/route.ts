import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { MOCK_MODE } from '@/lib/config';
import { confirmPayment } from '@/lib/payment';

/**
 * Webhook do Stripe (cartão).
 *
 * Em modo mock esta rota também aceita uma confirmação simples vinda da tela
 * de checkout simulada — assim o fluxo exercitado em desenvolvimento é o
 * mesmo que rodará em produção: alguém de fora avisa que pagou, e só então
 * a compra vira PAID.
 */
export async function POST(req: Request) {
  const body = await req.text();

  if (MOCK_MODE) {
    try {
      const { externalId, paid } = JSON.parse(body || '{}');
      if (!externalId) {
        return new NextResponse('Missing externalId', { status: 400 });
      }
      await confirmPayment(externalId, paid !== false);
      return new NextResponse(null, { status: 200 });
    } catch {
      return new NextResponse('Invalid body', { status: 400 });
    }
  }

  const signature = headers().get('Stripe-Signature');
  if (!signature) return new NextResponse('Missing signature', { status: 400 });

  try {
    const { parseWebhook } = await import('@/lib/payment/stripe');
    const result = parseWebhook(body, signature);

    // Evento que não interessa: responder 200 evita reenvio infinito.
    if (!result) return new NextResponse(null, { status: 200 });

    await confirmPayment(result.externalId, result.paid);
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
}
