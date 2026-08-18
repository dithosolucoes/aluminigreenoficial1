'use client';

/**
 * Rede de segurança final — só entra em cena se o próprio root layout
 * quebrar (raríssimo). Por isso é o único error boundary que precisa
 * desenhar <html>/<body> do zero e não pode depender de Tailwind
 * já ter carregado.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Algo deu errado
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 380, margin: 0 }}>
            Não foi possível carregar a plataforma agora. Tente novamente em instantes.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#059669',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
