import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { MOCK_MODE } from '@/lib/config';
import { db } from '@/lib/db';

/**
 * Sincroniza usuários do Clerk com a tabela User.
 *
 * Não é estritamente obrigatório — lib/auth faz upsert sob demanda nas rotas
 * que escrevem. Mas o webhook mantém nome e e-mail atualizados quando o aluno
 * edita o perfil no Clerk, e cuida da exclusão de conta.
 *
 * Configure em: Clerk Dashboard > Webhooks > <APP_URL>/api/webhook/clerk
 * Eventos: user.created, user.updated, user.deleted
 */
export async function POST(req: Request) {
  if (MOCK_MODE) return new NextResponse(null, { status: 200 });

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse('CLERK_WEBHOOK_SECRET ausente', { status: 500 });
  }

  const payload = await req.text();
  const h = headers();

  try {
    // svix acompanha o SDK do Clerk e valida a assinatura.
    const { Webhook } = await import('svix');
    const wh = new Webhook(secret);

    const evt = wh.verify(payload, {
      'svix-id': h.get('svix-id') ?? '',
      'svix-timestamp': h.get('svix-timestamp') ?? '',
      'svix-signature': h.get('svix-signature') ?? '',
    }) as { type: string; data: any };

    const d = evt.data;

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const email = d.email_addresses?.[0]?.email_address ?? '';
      const name =
        `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() ||
        email.split('@')[0] ||
        'Aluno';

      await db.user.upsert({
        where: { id: d.id },
        update: { email, name, imageUrl: d.image_url ?? null },
        create: { id: d.id, email, name, imageUrl: d.image_url ?? null },
      });
    }

    if (evt.type === 'user.deleted') {
      // Compras e progresso caem em cascata (onDelete: Cascade no schema).
      await db.user.deleteMany({ where: { id: d.id } });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.log('[CLERK_WEBHOOK]', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
}
