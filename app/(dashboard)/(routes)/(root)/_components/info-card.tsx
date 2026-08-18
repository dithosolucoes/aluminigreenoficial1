import { IconBadge } from '@/components/icon-badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  numberOfItems: number;
  variant?: 'default' | 'success';
  label: string;
  icon: LucideIcon;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  label,
  numberOfItems,
}: InfoCardProps) => {
  const isSuccess = variant === 'success';

  return (
    <div className={cn(
      'border rounded-xl flex items-center gap-x-4 p-4 transition-all duration-300 hover:shadow-md cursor-pointer select-none',
      isSuccess 
        ? 'bg-gradient-to-br from-emerald-50/40 to-emerald-50/10 border-emerald-100 hover:border-emerald-200' 
        : 'bg-gradient-to-br from-white to-slate-50/50 border-slate-100 hover:border-slate-200'
    )}>
      <div className="shrink-0">
        <IconBadge variant={variant} icon={Icon} />
      </div>
      <div className='flex flex-col min-w-0'>
        <p className={cn(
          'font-semibold text-base tracking-tight leading-none truncate',
          isSuccess ? 'text-emerald-950' : 'text-slate-800'
        )}>
          {label}
        </p>
        <p className='text-slate-500 text-sm mt-1 font-medium'>
          {numberOfItems} {numberOfItems === 1 ? 'Curso' : 'Cursos'}
        </p>
      </div>
    </div>
  );
};

