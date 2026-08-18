'use client';

/**
 * Sessão no lado do cliente.
 *
 * O layout do servidor já sabe quem está logado; em vez de cada componente
 * client consultar o provedor por conta própria (o que exigiria um hook
 * diferente para Clerk e para mock), a sessão desce por contexto.
 * Assim os componentes visuais não sabem nem se importam com qual provedor
 * está ativo.
 */

import { createContext, useContext } from 'react';

export interface Session {
  userId: string | null;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  isTeacher: boolean;
  mockMode: boolean;
}

const EMPTY: Session = {
  userId: null,
  name: null,
  email: null,
  imageUrl: null,
  isTeacher: false,
  mockMode: false,
};

const SessionContext = createContext<Session>(EMPTY);

export function SessionProvider({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
