'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ptBR } from '@clerk/localizations';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    // @clerk/localizations ficou parado na 4.15.3 enquanto @clerk/nextjs
    // seguiu recebendo patches — os tipos de DeepPartial<LocalizationResource>
    // de cada pacote divergiram, mas o formato de runtime é o mesmo.
    <ClerkProvider localization={ptBR as any} publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}


