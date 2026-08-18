import { NextResponse } from 'next/server';

import { MOCK_MODE } from '@/lib/config';
import { MOCK_SESSION_COOKIE, findMockUser } from '@/lib/auth/mock-users';

/**
 * Login/logout do modo mock.
 *
 * Só existe enquanto NEXT_PUBLIC_MOCK_MODE=true. Guarda o id do perfil
 * escolhido em cookie httpOnly — lib/auth lê daqui em toda requisição.
 */
export async function POST(req: Request) {
  if (!MOCK_MODE) {
    return new NextResponse('Indisponível fora do modo mock', { status: 404 });
  }

  const { userId } = await req.json().catch(() => ({ userId: null }));
  const user = findMockUser(userId);

  if (!user) {
    return new NextResponse('Perfil inválido', { status: 400 });
  }

  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set(MOCK_SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  if (!MOCK_MODE) {
    return new NextResponse('Indisponível fora do modo mock', { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MOCK_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
