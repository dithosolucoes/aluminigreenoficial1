/**
 * Em modo mock não existe middleware de autenticação — a proteção acontece
 * em cada página e rota via `auth()`. Isso permite rodar o sistema inteiro
 * sem nenhuma chave configurada.
 *
 * Em modo real o middleware do Clerk assume. Rotas públicas: a landing,
 * a busca, login/cadastro e os webhooks dos provedores de pagamento.
 */

import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/search',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/uploadthing(.*)',
];

export default function middleware(req: any) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    return NextResponse.next();
  }

  const { authMiddleware } = require('@clerk/nextjs');
  return authMiddleware({
    publicRoutes: PUBLIC_ROUTES,
  })(req);
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
