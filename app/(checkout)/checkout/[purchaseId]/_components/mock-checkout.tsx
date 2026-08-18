'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

import { formatPrice } from '@/lib/format';

interface MockCheckoutProps {
  purchaseId: string;
  externalId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  method: string;
  installments: number;
}

export const MockCheckout = ({
  externalId,
  courseId,
  courseTitle,
  amount,
  method: initialMethod,
  installments: initialInstallments,
}: MockCheckoutProps) => {
  const router = useRouter();
  const [method, setMethod] = useState(initialMethod === 'PIX' ? 'PIX' : 'CARD');
  const [installments, setInstallments] = useState(initialInstallments || 1);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

  const confirm = async () => {
    setStatus('processing');

    // Espera curta de propósito: reproduz a latência real do provedor,
    // para que a interface seja testada com o estado "processando".
    await new Promise((r) => setTimeout(r, 1800));

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId, paid: true }),
      });
      if (!res.ok) throw new Error();

      setStatus('done');
      toast.success('Pagamento confirmado!');
      setTimeout(() => {
        router.push(`/courses/${courseId}?success=1`);
        router.refresh();
      }, 1200);
    } catch {
      setStatus('idle');
      toast.error('Não foi possível confirmar o pagamento.');
    }
  };

  const parcela = amount / installments;

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='mb-4 flex items-center gap-x-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg'>
          <ShieldCheck className='h-3.5 w-3.5' />
          Ambiente de demonstração — nenhum valor é cobrado
        </div>

        <div className='bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
          <div className='h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600' />

          <div className='p-6'>
            <h1 className='text-lg font-extrabold text-slate-800 tracking-tight'>
              Finalizar matrícula
            </h1>
            <p className='text-xs text-slate-500 font-medium mt-0.5'>
              {courseTitle}
            </p>

            {status === 'done' ? (
              <div className='py-12 flex flex-col items-center gap-y-3'>
                <CheckCircle2 className='h-12 w-12 text-emerald-600' />
                <p className='text-sm font-bold text-slate-800'>
                  Pagamento aprovado
                </p>
                <p className='text-xs text-slate-500'>
                  Liberando seu acesso…
                </p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-2 gap-2 mt-5'>
                  <button
                    onClick={() => setMethod('CARD')}
                    disabled={status === 'processing'}
                    className={`flex flex-col items-center gap-y-1.5 p-3 rounded-xl border-2 transition-all ${
                      method === 'CARD'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className='h-5 w-5 text-slate-700' />
                    <span className='text-xs font-bold text-slate-700'>
                      Cartão
                    </span>
                    <span className='text-[9px] text-slate-400'>Stripe</span>
                  </button>

                  <button
                    onClick={() => setMethod('PIX')}
                    disabled={status === 'processing'}
                    className={`flex flex-col items-center gap-y-1.5 p-3 rounded-xl border-2 transition-all ${
                      method === 'PIX'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <QrCode className='h-5 w-5 text-slate-700' />
                    <span className='text-xs font-bold text-slate-700'>Pix</span>
                    <span className='text-[9px] text-slate-400'>
                      Mercado Pago
                    </span>
                  </button>
                </div>

                {method === 'CARD' && (
                  <div className='mt-4'>
                    <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                      Parcelamento
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      disabled={status === 'processing'}
                      className='mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de {formatPrice(amount / n)}
                          {n === 1 ? ' à vista' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {method === 'PIX' && (
                  <div className='mt-4 flex flex-col items-center gap-y-2 bg-slate-50 border border-slate-200 rounded-xl p-5'>
                    <div className='h-28 w-28 bg-white border-2 border-slate-300 rounded-lg flex items-center justify-center'>
                      <QrCode className='h-16 w-16 text-slate-300' />
                    </div>
                    <p className='text-[10px] text-slate-400 text-center leading-relaxed'>
                      Aqui aparecerá o QR Code real gerado pelo Mercado Pago.
                    </p>
                  </div>
                )}

                <div className='mt-5 pt-4 border-t border-slate-100 flex items-end justify-between'>
                  <span className='text-xs font-semibold text-slate-500'>
                    Total
                  </span>
                  <div className='text-right'>
                    <p className='text-xl font-extrabold text-slate-800'>
                      {formatPrice(amount)}
                    </p>
                    {method === 'CARD' && installments > 1 && (
                      <p className='text-[10px] text-slate-400'>
                        {installments}x de {formatPrice(parcela)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={confirm}
                  disabled={status === 'processing'}
                  className='mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-x-2'
                >
                  {status === 'processing' ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Processando pagamento…
                    </>
                  ) : (
                    <>Confirmar pagamento</>
                  )}
                </button>

                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  disabled={status === 'processing'}
                  className='mt-2 w-full text-xs font-semibold text-slate-400 hover:text-slate-600 py-2 flex items-center justify-center gap-x-1.5 disabled:opacity-50'
                >
                  <ArrowLeft className='h-3 w-3' />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
