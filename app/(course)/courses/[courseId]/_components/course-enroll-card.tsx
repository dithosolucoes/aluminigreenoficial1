'use client';

import { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, Award, Infinity, HelpCircle, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

interface CourseEnrollCardProps {
  courseId: string;
  price: number;
}

export const CourseEnrollCard = ({ courseId, price }: CourseEnrollCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<'CARD' | 'PIX'>('CARD');
  const [installments, setInstallments] = useState<number>(1);

  const onEnroll = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${courseId}/checkout`, {
        method,
        installments,
      });
      window.location.assign(response.data.url);
    } catch (error) {
      toast.error('Ocorreu um erro ao processar sua inscrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to generate installment list
  const installmentOptions = Array.from({ length: 12 }, (_, i) => {
    const months = i + 1;
    // Calculate a simple simulated value without complex interest for UI representation
    const value = price / months;
    return {
      months,
      value,
      label: `${months}x de ${formatPrice(value)} sem juros`,
    };
  });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-100/50 sticky top-24">
      {/* Visual Badge */}
      <div className="inline-flex items-center gap-x-1 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
        <Sparkles className="h-3 w-3 text-emerald-600 animate-pulse" />
        Inscrições Abertas
      </div>

      {/* Pricing Header */}
      <div className="space-y-1 mb-6">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Investimento Único</p>
        <div className="flex items-baseline gap-x-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatPrice(price)}</span>
        </div>
        <p className="text-slate-500 text-xs font-medium">
          ou em até <span className="font-semibold text-emerald-700">12x de {formatPrice(price / 12)}</span>
        </p>
      </div>

      {/* Method Tabs */}
      <div className="space-y-4 mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          Escolha a forma de pagamento
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button
            onClick={() => {
              setMethod('CARD');
              setInstallments(1);
            }}
            type="button"
            className={`flex items-center justify-center gap-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              method === 'CARD'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Cartão de Crédito
          </button>
          <button
            onClick={() => {
              setMethod('PIX');
              setInstallments(1);
            }}
            type="button"
            className={`flex items-center justify-center gap-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              method === 'PIX'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Pix Imediato
          </button>
        </div>
      </div>

      {/* Conditional Inputs */}
      {method === 'CARD' && (
        <div className="space-y-4 mb-6 animate-fadeIn">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Parcelamento
          </label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            {installmentOptions.map((opt) => (
              <option key={opt.months} value={opt.months}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {method === 'PIX' && (
        <div className="mb-6 p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1.5 animate-fadeIn">
          <p className="font-bold flex items-center gap-x-1.5">
            <QrCode className="h-4 w-4 text-emerald-700" />
            Liberação instantânea
          </p>
          <p className="leading-relaxed font-medium">
            O código Pix &quot;Copia e Cola&quot; e o QR Code serão gerados imediatamente. O curso é ativado em sua conta na mesma hora após o pagamento.
          </p>
        </div>
      )}

      {/* Core CTA */}
      <Button
        onClick={onEnroll}
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
      >
        {isLoading ? 'Processando inscrição...' : 'Fazer Minha Matrícula'}
      </Button>

      {/* Safety Badges */}
      <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
        <div className="flex items-center gap-x-3 text-xs text-slate-500 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Garantia incondicional de 7 dias</span>
        </div>
        <div className="flex items-center gap-x-3 text-xs text-slate-500 font-medium">
          <Award className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Certificado oficial Alumini Green incluso</span>
        </div>
        <div className="flex items-center gap-x-3 text-xs text-slate-500 font-medium">
          <Infinity className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Acesso vitalício ao conteúdo e atualizações</span>
        </div>
        <div className="flex items-center gap-x-3 text-xs text-slate-500 font-medium">
          <HelpCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Suporte premium a dúvidas na plataforma</span>
        </div>
      </div>
    </div>
  );
};
