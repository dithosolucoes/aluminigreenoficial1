/**
 * Adaptador de pagamento.
 *
 * Cartão → Stripe (parcelamento em até 12x no Brasil)
 * Pix    → Mercado Pago
 * Mock   → simula os dois, percorrendo o MESMO caminho do real:
 *          checkout cria a compra como PENDING, o webhook confirma e vira PAID.
 *
 * É essa simetria que faz a troca para as chaves reais ser só configuração:
 * o fluxo já foi construído e testado com os mesmos estados.
 */

import { MOCK_MODE, config } from '@/lib/config';
import { db } from '@/lib/db';

export type Method = 'CARD' | 'PIX';

export interface CheckoutResult {
  /** Para onde redirecionar o navegador do aluno */
  url: string;
  purchaseId: string;
  externalId: string;
}

export interface WebhookResult {
  externalId: string;
  status: 'PAID' | 'FAILED';
}

/* -------------------------------------------------------------------------- */
/* Checkout                                                                    */
/* -------------------------------------------------------------------------- */

export async function createCheckout(opts: {
  userId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  method: Method;
  installments?: number;
  userEmail: string;
}): Promise<CheckoutResult> {
  const provider = MOCK_MODE
    ? 'MOCK'
    : opts.method === 'PIX'
    ? 'MERCADOPAGO'
    : 'STRIPE';

  // A compra nasce PENDING nos três casos. Só o webhook promove para PAID.
  const purchase = await db.purchase.upsert({
    where: {
      userId_courseId: { userId: opts.userId, courseId: opts.courseId },
    },
    update: {
      status: 'PENDING',
      provider,
      method: opts.method,
      amount: opts.amount,
      installments: opts.installments ?? 1,
    },
    create: {
      userId: opts.userId,
      courseId: opts.courseId,
      status: 'PENDING',
      provider,
      method: opts.method,
      amount: opts.amount,
      installments: opts.installments ?? 1,
    },
  });

  if (MOCK_MODE) {
    const externalId = `mock_${purchase.id.slice(0, 8)}`;
    await db.purchase.update({
      where: { id: purchase.id },
      data: { externalId },
    });

    // Tela interna que imita a página do provedor: mostra Pix/cartão,
    // deixa confirmar ou cancelar, e chama o webhook simulado.
    return {
      url: `/checkout/${purchase.id}`,
      purchaseId: purchase.id,
      externalId,
    };
  }

  if (opts.method === 'PIX') {
    const { createPixCharge } = await import('./mercadopago');
    const charge = await createPixCharge(opts, purchase.id);
    await db.purchase.update({
      where: { id: purchase.id },
      data: { externalId: charge.externalId },
    });
    return { ...charge, purchaseId: purchase.id };
  }

  const { createCardCheckout } = await import('./stripe');
  const session = await createCardCheckout(opts, purchase.id);
  await db.purchase.update({
    where: { id: purchase.id },
    data: { externalId: session.externalId },
  });
  return { ...session, purchaseId: purchase.id };
}

/* -------------------------------------------------------------------------- */
/* Confirmação (webhook)                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Promove a compra para PAID. Idempotente — provedores reenviam webhook,
 * e reenvio não pode duplicar nem reverter nada.
 */
export async function confirmPayment(externalId: string, paid = true) {
  const purchase = await db.purchase.findFirst({ where: { externalId } });
  if (!purchase) return null;
  if (purchase.status === 'PAID') return purchase; // já processado

  const updated = await db.purchase.update({
    where: { id: purchase.id },
    data: {
      status: paid ? 'PAID' : 'FAILED',
      paidAt: paid ? new Date() : null,
    },
    include: { user: true, course: true },
  });

  if (paid && updated.user?.email) {
    const { sendPurchaseConfirmation } = await import('@/lib/email');
    // Falha de e-mail não pode reverter uma compra já confirmada.
    await sendPurchaseConfirmation(
      updated.user.email,
      updated.user.name,
      updated.course.title,
      updated.courseId
    ).catch((e) => console.error('[EMAIL_CONFIRMACAO]', e));
  }

  return updated;
}

/**
 * Matrícula manual dada pelo professor — sem cobrança, já entra paga.
 */
export async function grantManualAccess(userId: string, courseId: string) {
  return db.purchase.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: 'PAID', provider: 'MANUAL', paidAt: new Date() },
    create: {
      userId,
      courseId,
      status: 'PAID',
      provider: 'MANUAL',
      method: 'NONE',
      amount: 0,
      paidAt: new Date(),
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Consulta de acesso                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Fonte única da verdade para "este aluno pode assistir este curso?".
 * Antes o código só checava se a linha Purchase existia — agora exige
 * pagamento confirmado e matrícula não suspensa.
 */
export async function hasAccess(userId: string, courseId: string) {
  const purchase = await db.purchase.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  return !!purchase && purchase.status === 'PAID' && !purchase.isSuspended;
}

export const paymentConfig = {
  maxInstallments: config.payment.maxInstallments,
  pixEnabled: config.payment.pixEnabled,
};
