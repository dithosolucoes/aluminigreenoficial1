'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-x-2.5 transition-opacity hover:opacity-90">
      <div className="flex items-center gap-x-2 py-1">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-800 text-base leading-none tracking-tight">
            Alumini<span className="text-emerald-600 font-black">Green</span>
          </span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Educação & ESG
          </span>
        </div>
      </div>
    </Link>
  );
};

