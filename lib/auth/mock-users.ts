/**
 * Usuários de teste do modo mock.
 *
 * Estes mesmos usuários são gravados no banco pelo seed (scripts/seed.ts),
 * então as chaves estrangeiras batem. O cookie de sessão guarda só o `id`;
 * papel e nome saem daqui, sem consultar o banco — assim `isTeacher()`
 * continua sendo uma função síncrona e nenhum call site precisou mudar.
 */

export type MockRole = 'STUDENT' | 'TEACHER';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: MockRole;
  /** Texto curto mostrado no seletor, explicando pra que serve este usuário */
  hint: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'mock_teacher_admin',
    email: 'contato@aluminigreen.org',
    name: 'Equipe Alumini Green',
    firstName: 'Equipe',
    lastName: 'Alumini Green',
    role: 'TEACHER',
    hint: 'Administra cursos, alunos e financeiro',
  },
  {
    id: 'mock_student_ana',
    email: 'ana.souza@exemplo.com',
    name: 'Ana Souza',
    firstName: 'Ana',
    lastName: 'Souza',
    role: 'STUDENT',
    hint: 'Já comprou cursos e tem progresso',
  },
  {
    id: 'mock_student_bruno',
    email: 'bruno.lima@exemplo.com',
    name: 'Bruno Lima',
    firstName: 'Bruno',
    lastName: 'Lima',
    role: 'STUDENT',
    hint: 'Não comprou nada — vê tudo bloqueado',
  },
];

export const MOCK_SESSION_COOKIE = 'ag_mock_user';

export function findMockUser(id?: string | null): MockUser | null {
  if (!id) return null;
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}
