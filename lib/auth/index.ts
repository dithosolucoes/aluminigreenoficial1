/**
 * Adaptador de autenticação.
 *
 * O resto da aplicação importa daqui — nunca de '@clerk/nextjs' direto.
 * Trocar entre simulado e real é a variável NEXT_PUBLIC_MOCK_MODE.
 *
 * As assinaturas foram mantidas idênticas às do Clerk (`auth()` síncrono,
 * `currentUser()` assíncrono) justamente para que a troca não exija mexer
 * em nenhum call site.
 */

import { cookies } from 'next/headers';
import { MOCK_MODE } from '@/lib/config';
import { MOCK_SESSION_COOKIE, findMockUser, MOCK_USERS } from './mock-users';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  role: 'STUDENT' | 'TEACHER';
}

/* -------------------------------------------------------------------------- */
/* auth() — quem está logado nesta requisição                                  */
/* -------------------------------------------------------------------------- */

export function auth(): { userId: string | null } {
  if (MOCK_MODE) {
    try {
      const id = cookies().get(MOCK_SESSION_COOKIE)?.value;
      // Sem cookie = visitante. É isto que faz a landing page aparecer.
      return { userId: findMockUser(id)?.id ?? null };
    } catch {
      // cookies() lança fora do contexto de requisição (ex.: durante o build)
      return { userId: null };
    }
  }

  const { auth: clerkAuth } = require('@clerk/nextjs');
  return clerkAuth();
}

/* -------------------------------------------------------------------------- */
/* currentUser() — dados de perfil de quem está logado                         */
/* -------------------------------------------------------------------------- */

export async function currentUser(): Promise<AuthUser | null> {
  if (MOCK_MODE) {
    const { userId } = auth();
    const u = findMockUser(userId);
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: null,
      role: u.role,
    };
  }

  const { currentUser: clerkCurrentUser } = require('@clerk/nextjs');
  const u = await clerkCurrentUser();
  if (!u) return null;

  const email = u.emailAddresses?.[0]?.emailAddress ?? '';
  const firstName = u.firstName ?? 'Aluno';
  const lastName = u.lastName ?? '';

  return {
    id: u.id,
    email,
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    imageUrl: u.imageUrl ?? null,
    role: isTeacher(u.id, email) ? 'TEACHER' : 'STUDENT',
  };
}

/* -------------------------------------------------------------------------- */
/* isTeacher() — síncrono de propósito                                         */
/* -------------------------------------------------------------------------- */
/**
 * Em modo mock o papel vem da tabela estática de usuários de teste.
 * Em produção, compara com o ID do professor definido no .env.
 * Nos dois casos é síncrono — sem consulta ao banco, sem await.
 */
/**
 * Lista extra de e-mails com acesso de professor, além do NEXT_PUBLIC_TEACHER_ID.
 * Vem do ambiente para não deixar e-mail de pessoa física no código-fonte.
 */
export const OFFICIAL_ADMIN_EMAILS = (process.env.OFFICIAL_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isTeacher(userId?: string | null, userEmail?: string | null): boolean {
  if (!userId) return false;

  if (MOCK_MODE) {
    return findMockUser(userId)?.role === 'TEACHER';
  }

  // Se o email oficial do admin for passado
  if (userEmail && OFFICIAL_ADMIN_EMAILS.includes(userEmail.toLowerCase().trim())) {
    return true;
  }

  const teacherIds = (process.env.NEXT_PUBLIC_TEACHER_ID || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (teacherIds.includes(userId.toLowerCase())) return true;
  if (userEmail && teacherIds.includes(userEmail.toLowerCase().trim())) return true;

  return false;
}

/* -------------------------------------------------------------------------- */
/* Sincronização com o banco                                                   */
/* -------------------------------------------------------------------------- */
/**
 * Garante que existe uma linha em `User` para quem está logado.
 *
 * As tabelas Purchase / UserProgress / Question / Answer têm chave
 * estrangeira para User. Com o Clerk, o usuário nasce lá fora — se
 * dependêssemos só de webhook, uma falha de webhook quebraria o app inteiro
 * com erro de FK. Chamando isto no início das rotas que escrevem, o usuário
 * é criado sob demanda e o webhook vira apenas otimização.
 */
export async function syncCurrentUser() {
  const u = await currentUser();
  if (!u) return null;

  const { db } = await import('@/lib/db');

  return db.user.upsert({
    where: { id: u.id },
    update: { email: u.email, name: u.name, imageUrl: u.imageUrl ?? null },
    create: {
      id: u.id,
      email: u.email,
      name: u.name,
      imageUrl: u.imageUrl ?? null,
      role: u.role,
    },
  });
}

export { MOCK_USERS, MOCK_SESSION_COOKIE };
