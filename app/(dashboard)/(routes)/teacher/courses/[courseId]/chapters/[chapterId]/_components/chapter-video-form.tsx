'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { Chapter, VideoAsset } from '@prisma/client';
import { FileUpload } from '@/components/file-upload';
import { VideoPreview } from '@/components/video-preview';

interface ChapterVideoFormProps {
  initialData: Chapter & { videoAsset?: VideoAsset | null };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values
      );
      toast.success('Capítulo atualizado com sucesso!');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('Ocorreu um erro.');
    }
  };

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        Vídeo do capítulo
        <Button onClick={toggleEdit} variant='ghost'>
          {isEditing && <>Cancelar</>}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className='h-4 w-4 mr-2' />
              Adicionar vídeo
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className='h-4 w-4 mr-2' />
              Editar
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.videoUrl ? (
          <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
            <Video className='h-10 w-10 text-slate-500' />
          </div>
        ) : (
          <div className='relative aspect-video mt-2'>
            <VideoPreview asset={initialData?.videoAsset ?? null} />
          </div>
        ))}
      {isEditing && (
        <div className=''>
          <FileUpload
            endpoint='chapterVideo'
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <div className='text-sm text-muted-foreground mt-4'>
            <p>Envie o vídeo para este capítulo.</p>
          </div>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className='text-xs text-muted-foreground mt-2'>
          Os vídeos podem levar alguns minutos para serem processados. Atualize a
          página se o vídeo não aparecer.
        </div>
      )}
    </div>
  );
};

export default ChapterVideoForm;
