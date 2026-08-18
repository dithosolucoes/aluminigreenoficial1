/**
 * Mercado Pago — usado APENAS para Pix.
 *
 * Motivo da divisão: na Stripe o Pix é liberado sob convite para empresas
 * sediadas no Brasil, e Pix é mais de 40% das transações online do país.
 * Cartão fica na Stripe (parcelamento), Pix vem por aqui.
 *
 * Só é importado quando MOCK_MODE=false e o método é PIX.
 */

import { config } from '@/lib/config';

const MP_API = 'https://api.mercadopago.com/v1/payments';

export async function createPixCharge(
  opts: {
    courseId: string;
    courseTitle: string;
    amount: number;
    userEmail: string;
  },
  purchaseId: string
) {
  const res = await fetch(MP_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      // Evita cobrança duplicada se a requisição for reenviada.
      'X-Idempotency-Key': purchaseId,
    },
    body: JSON.stringify({
      transaction_amount: Number(opts.amount.toFixed(2)),
      description: opts.courseTitle,
      payment_method_id: 'pix',
      payer: { email: opts.userEmail },
      notification_url: `${config.app.url}/api/webhook/mercadopago`,
      metadata: { purchase_id: purchaseId },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Mercado Pago: falha ao gerar Pix — ${detail}`);
  }

  const data = await res.json();
  const tx = data.point_of_interaction?.transaction_data;

  return {
    // Página interna que mostra o QR Code e fica aguardando a confirmação.
    url: `/checkout/pix/${purchaseId}`,
    externalId: String(data.id),
    qrCode: tx?.qr_code as string | undefined,
    qrCodeBase64: tx?.qr_code_base64 as string | undefined,
    expiresAt: data.date_of_expiration as string | undefined,
  };
}

/**
 * O webhook do Mercado Pago avisa que algo mudou, mas não manda o estado.
 * É preciso consultar o pagamento para saber se foi aprovado.
 */
export async function fetchPaymentStatus(paymentId: string) {
  const res = await fetch(`${MP_API}/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) return { externalId: paymentId, paid: false };

  const data = await res.json();
  return { externalId: String(data.id), paid: data.status === 'approved' };
}
