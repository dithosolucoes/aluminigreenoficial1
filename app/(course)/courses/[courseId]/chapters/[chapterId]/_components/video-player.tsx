'use client';

/**
 * Player de aula.
 *
 * Recebe a URL já resolvida pelo servidor (lib/video → getPlaybackUrl), então
 * não precisa saber qual provedor está ativo. Em modo mock a URL é um .mp4
 * e usamos <video>; com o Bunny é o iframe do Stream.
 */

import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfettiStore } from '@/hooks/use-confetti-store';

interface VideoPlayerProps {
  playbackUrl: string | null;
  provider: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackUrl,
  provider,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    if (!completeOnEnd) return;
    try {
      await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        { isCompleted: true }
      );
      if (!nextChapterId) confetti.onOpen();
      toast.success('Progresso atualizado!');
      router.refresh();
      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }
    } catch {
      toast.error('Ocorreu um erro ao salvar seu progresso.');
    }
  };

  if (isLocked) {
    return (
      <div className='relative aspect-video'>
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary rounded-md'>
          <Lock className='h-8 w-8' />
          <p className='text-sm'>Esta aula está bloqueada.</p>
        </div>
      </div>
    );
  }

  if (!playbackUrl) {
    return (
      <div className='relative aspect-video'>
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-slate-300 rounded-md'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-sm'>O vídeo ainda está sendo processado.</p>
        </div>
      </div>
    );
  }

  const isMock = provider === 'MOCK';

  return (
    <div className='relative aspect-video'>
      {!isReady && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800 rounded-md'>
          <Loader2 className='h-8 w-8 animate-spin text-secondary' />
        </div>
      )}

      {isMock ? (
        <>
          <video
            src={playbackUrl}
            title={title}
            controls
            onCanPlay={() => setIsReady(true)}
            onEnded={onEnd}
            className={cn(
              'w-full h-full object-contain bg-black rounded-md',
              !isReady && 'hidden'
            )}
          />
          {isReady && (
            <div className='absolute top-2 left-2 bg-black/60 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-sm pointer-events-none'>
              Vídeo de demonstração
            </div>
          )}
        </>
      ) : (
        <iframe
          src={playbackUrl}
          title={title}
          loading='lazy'
          onLoad={() => setIsReady(true)}
          allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen'
          allowFullScreen
          className={cn(
            'w-full h-full rounded-md border-0',
            !isReady && 'hidden'
          )}
        />
      )}
    </div>
  );
};
