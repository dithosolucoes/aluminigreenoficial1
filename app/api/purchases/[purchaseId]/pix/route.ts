import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { MOCK_MODE } from '@/lib/config';

/**
 * Devolve o QR Code Pix da cobrança.
 * Consultado ao vivo no Mercado Pago para não guardar o código no banco.
 */
export async function GET(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  const { userId } = auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const purchase = await db.purchase.findUnique({
    where: { id: params.purchaseId },
  });

  if (!purchase) return new NextResponse('Not Found', { status: 404 });
  if (purchase.userId !== userId) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (MOCK_MODE || !purchase.externalId) return NextResponse.json({});

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${purchase.externalId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );

  if (!res.ok) return NextResponse.json({});

  const data = await res.json();
  const tx = data.point_of_interaction?.transaction_data;

  return NextResponse.json({
    qrCode: tx?.qr_code,
    qrCodeBase64: tx?.qr_code_base64,
  });
}
