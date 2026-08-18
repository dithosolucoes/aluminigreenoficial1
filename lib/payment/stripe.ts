/**
 * Stripe — cartão de crédito, com parcelamento brasileiro.
 *
 * Só é importado quando MOCK_MODE=false. Enquanto o cliente não tiver conta,
 * este arquivo nunca é carregado.
 */

import Stripe from 'stripe';
import { config } from '@/lib/config';

let client: Stripe | null = null;

function stripeClient() {
  if (!client) {
    client = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: '2023-08-16',
      typescript: true,
    });
  }
  return client;
}

export async function createCardCheckout(
  opts: {
    courseId: string;
    courseTitle: string;
    amount: number;
    userEmail: string;
    installments?: number;
  },
  purchaseId: string
) {
  const session = await stripeClient().checkout.sessions.create({
    customer_email: opts.userEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'brl',
          product_data: { name: opts.courseTitle },
          unit_amount: Math.round(opts.amount * 100),
        },
      },
    ],
    mode: 'payment',
    // Parcelamento em cartões brasileiros — Stripe Brasil permite até 12x.
    payment_method_options: {
      card: {
        installments: { enabled: true },
      },
    },
    success_url: `${config.app.url}/courses/${opts.courseId}?success=1`,
    cancel_url: `${config.app.url}/courses/${opts.courseId}?canceled=1`,
    metadata: { purchaseId },
  });

  return {
    url: session.url!,
    externalId: session.id,
  };
}

/** Valida a assinatura do webhook e devolve o que interessa. */
export function parseWebhook(body: string, signature: string) {
  const event = stripeClient().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type !== 'checkout.session.completed') return null;

  const session = event.data.object as Stripe.Checkout.Session;
  return { externalId: session.id, paid: session.payment_status === 'paid' };
}
