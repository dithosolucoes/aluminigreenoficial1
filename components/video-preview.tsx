'use client';

/**
 * Prévia do vídeo no painel do professor.
 * Igual ao player do aluno, sem controle de progresso.
 */

import { Loader2, Video } from 'lucide-react';

interface VideoPreviewProps {
  asset: {
    provider: string;
    playbackId?: string | null;
    libraryId?: string | null;
    status?: string;
  } | null;
}

export const VideoPreview = ({ asset }: VideoPreviewProps) => {
  if (!asset) {
    return (
      <div className='flex items-center justify-center h-full bg-slate-200 rounded-md'>
        <Video className='h-10 w-10 text-slate-500' />
      </div>
    );
  }

  if (asset.status && asset.status !== 'READY') {
    return (
      <div className='flex flex-col gap-y-2 items-center justify-center h-full bg-slate-200 rounded-md text-slate-600'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <p className='text-xs font-medium'>Processando o vídeo…</p>
      </div>
    );
  }

  if (asset.provider === 'MOCK') {
    return (
      <video
        src={asset.playbackId || ''}
        controls
        className='w-full h-full object-contain bg-black rounded-md'
      />
    );
  }

  const lib = asset.libraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

  return (
    <iframe
      src={`https://iframe.mediadelivery.net/embed/${lib}/${asset.playbackId}`}
      loading='lazy'
      allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen'
      allowFullScreen
      className='w-full h-full rounded-md border-0'
    />
  );
};
