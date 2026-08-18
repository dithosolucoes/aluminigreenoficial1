import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { IconBadge } from '@/components/icon-badge';
import { formatPrice } from '@/lib/format';
import { CourseProgress } from './course-progress';

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`}>
      <div className='group hover:shadow-md hover:border-slate-200/80 transition-all duration-300 overflow-hidden border border-slate-100 rounded-xl p-3 h-full flex flex-col bg-white'>
        <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100'>
          <Image 
            fill 
            className='object-cover group-hover:scale-105 transition-transform duration-500' 
            alt={title} 
            src={imageUrl} 
          />
        </div>
        <div className='flex flex-col flex-1 pt-3'>
          <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mb-2 uppercase tracking-wider'>
            {category}
          </span>
          <div className='text-base font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2 leading-snug'>
            {title}
          </div>
          
          <div className='mt-3 mb-4 flex items-center gap-x-2 text-xs'>
            <div className='flex items-center gap-x-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md'>
              <BookOpen className='h-3.5 w-3.5 text-slate-400' />
              <span className="font-medium">
                {chaptersLength}{' '}
                {chaptersLength === 1 ? 'Capítulo' : 'Capítulos'}
              </span>
            </div>
          </div>
          
          <div className="mt-auto pt-2 border-t border-slate-50">
            {progress !== null ? (
              <CourseProgress
                size='sm'
                value={progress}
                variant={progress === 100 ? 'success' : 'default'}
              />
            ) : (
              <p className='text-sm font-bold text-slate-900'>
                {formatPrice(price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

