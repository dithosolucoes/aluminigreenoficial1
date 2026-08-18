/**
 * Configuração central da aplicação.
 *
 * Um único lugar decide se o sistema roda simulado ou de verdade.
 * Ninguém mais no código deve ler process.env diretamente para isso.
 */

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export const config = {
  mock: MOCK_MODE,

  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Alumini Green',
    cnpj: process.env.NEXT_PUBLIC_COMPANY_CNPJ || '',
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contato@aluminigreen.org',
    whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '5585991237273',
  },

  video: {
    libraryId: process.env.BUNNY_LIBRARY_ID || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '',
    cdnHostname: process.env.BUNNY_STREAM_HOSTNAME || process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || '',
    apiKey: process.env.BUNNY_STREAM_API_KEY || process.env.BUNNY_API_KEY || '',
  },

  payment: {
    maxInstallments: Number(process.env.NEXT_PUBLIC_MAX_INSTALLMENTS || 12),
    pixEnabled: process.env.NEXT_PUBLIC_PIX_ENABLED === 'true' || MOCK_MODE,
  },
} as const;

/**
 * Em modo real, avisa cedo se faltar chave — melhor quebrar no boot com uma
 * mensagem clara do que falhar no meio de uma compra.
 */
export function assertRealModeConfig() {
  if (MOCK_MODE) return;

  const required: Record<string, string | undefined> = {
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length && process.env.NODE_ENV === 'production') {
    console.warn(
      `[Config] Variáveis recomendadas não encontradas: ${missing.join(', ')}`
    );
  }
}
