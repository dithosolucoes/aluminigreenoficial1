'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Conteúdo visual compartilhado pelos error.tsx de cada grupo de rotas.
 * Sem isso, qualquer falha (ex.: banco fora do ar) derrubava a tela crua
 * de erro do Next em produção.
 */
export const ErrorState = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error('[PAGE_ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-y-4 p-8 text-center">
      <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800">Algo deu errado</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Não foi possível carregar esta página agora. Tente novamente em instantes.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
      >
        <RotateCcw className="h-4 w-4" />
        Tentar de novo
      </button>
    </div>
  );
};
