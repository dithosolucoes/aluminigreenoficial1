'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Copy, Check, QrCode } from 'lucide-react';

import { formatPrice } from '@/lib/format';

interface PixWaitingProps {
  purchaseId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
}

export const PixWaiting = ({
  purchaseId,
  courseId,
  courseTitle,
  amount,
}: PixWaitingProps) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pix, setPix] = useState<{ qrCode?: string; qrCodeBase64?: string }>({});

  // Busca o QR Code e depois fica consultando até o webhook confirmar.
  useEffect(() => {
    let alive = true;

    const load = async () => {
      const res = await fetch(`/api/purchases/${purchaseId}/pix`);
      if (!res.ok || !alive) return;
      setPix(await res.json());
    };

    const poll = setInterval(async () => {
      const res = await fetch(`/api/purchases/${purchaseId}/status`);
      if (!res.ok || !alive) return;
      const { status } = await res.json();
      if (status === 'PAID') {
        clearInterval(poll);
        toast.success('Pagamento confirmado!');
        router.push(`/courses/${courseId}?success=1`);
        router.refresh();
      }
    }, 4000);

    load();
    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, [purchaseId, courseId, router]);

  const copy = async () => {
    if (!pix.qrCode) return;
    await navigator.clipboard.writeText(pix.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
        <div className='h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600' />

        <div className='p-6 text-center'>
          <h1 className='text-lg font-extrabold text-slate-800'>
            Pague com Pix
          </h1>
          <p className='text-xs text-slate-500 font-medium mt-0.5'>
            {courseTitle}
          </p>
          <p className='text-2xl font-extrabold text-slate-900 mt-3'>
            {formatPrice(amount)}
          </p>

          <div className='mt-5 flex justify-center'>
            {pix.qrCodeBase64 ? (
              <img
                src={`data:image/png;base64,${pix.qrCodeBase64}`}
                alt='QR Code Pix'
                className='h-52 w-52 border border-slate-200 rounded-lg'
              />
            ) : (
              <div className='h-52 w-52 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-y-2 text-slate-300'>
                <QrCode className='h-12 w-12' />
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            )}
          </div>

          {pix.qrCode && (
            <button
              onClick={copy}
              className='mt-4 w-full flex items-center justify-center gap-x-2 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl py-3 text-xs font-bold text-slate-700 transition-all'
            >
              {copied ? (
                <>
                  <Check className='h-3.5 w-3.5 text-emerald-600' />
                  Código copiado
                </>
              ) : (
                <>
                  <Copy className='h-3.5 w-3.5' />
                  Copiar código Pix
                </>
              )}
            </button>
          )}

          <div className='mt-5 flex items-center justify-center gap-x-2 text-xs text-slate-400 font-medium'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            Aguardando confirmação do pagamento…
          </div>

          <p className='text-[10px] text-slate-400 mt-3 leading-relaxed'>
            Assim que o Pix cair, seu acesso é liberado automaticamente.
            Pode deixar esta página aberta.
          </p>
        </div>
      </div>
    </div>
  );
};
