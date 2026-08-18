'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Course } from '@prisma/client';
import { FileUpload } from '@/components/file-upload';

interface DescriptionFormProps {
  initialData: Course;
  courseId: string;
}

const formSchema = z.object({
  imageUrl: z.string().min(1, {
    message: 'A imagem é obrigatória',
  }),
});

export const DescriptionForm = ({
  initialData,
  courseId,
}: DescriptionFormProps) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('Curso atualizado com sucesso!');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('Ocorreu um erro.');
    }
  };

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        Imagem do Curso
        <Button onClick={toggleEdit} variant='ghost'>
          {isEditing && <>Cancelar</>}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className='h-4 w-4 mr-2' />
              Adicionar imagem
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className='h-4 w-4 mr-2' />
              Editar
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.imageUrl ? (
          <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
            <ImageIcon className='h-10 w-10 text-slate-500' />
          </div>
        ) : (
          <div className='relative aspect-video mt-2'>
            <Image
              alt='Upload'
              fill
              className='object-cover rounded-md'
              src={initialData.imageUrl}
            />
          </div>
        ))}
      {isEditing && (
        <div className=''>
          <FileUpload
            endpoint='courseImage'
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className='text-sm text-muted-foreground mt-4'>
            <p>As imagens devem ter o tamanho recomendado de 1280x720px (proporção 16:9)</p>
            <p>Formatos aceitos: JPG, PNG, GIF</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionForm;
