import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createVideo, deleteVideo } from '@/lib/video';

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId, userId },
    });

    if (!ownCourse) return new NextResponse('Unauthorized', { status: 401 });

    const chapter = await db.chapter.update({
      where: { id: params.chapterId, courseId: params.courseId },
      data: { ...values },
    });

    if (values.videoUrl) {
      // Substituindo o vídeo: apaga o anterior no provedor antes de criar o
      // novo, senão o arquivo antigo fica órfão consumindo armazenamento.
      const existing = await db.videoAsset.findFirst({
        where: { chapterId: params.chapterId },
      });

      if (existing) {
        await deleteVideo(existing.assetId, existing.libraryId);
        await db.videoAsset.delete({ where: { id: existing.id } });
      }

      const asset = await createVideo({
        title: chapter.title,
        sourceUrl: values.videoUrl,
      });

      await db.videoAsset.create({
        data: {
          chapterId: params.chapterId,
          provider: asset.provider,
          assetId: asset.assetId,
          playbackId: asset.playbackId,
          libraryId: asset.libraryId,
          status: asset.status,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('[COURSES_CHAPTER_ID]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId, userId },
    });
    if (!ownCourse) return new NextResponse('Unauthorized', { status: 401 });

    const chapter = await db.chapter.findUnique({
      where: { id: params.chapterId, courseId: params.courseId },
    });
    if (!chapter) return new NextResponse('Not Found', { status: 404 });

    const existing = await db.videoAsset.findFirst({
      where: { chapterId: params.chapterId },
    });

    if (existing) {
      await deleteVideo(existing.assetId, existing.libraryId);
      await db.videoAsset.delete({ where: { id: existing.id } });
    }

    const deletedChapter = await db.chapter.delete({
      where: { id: params.chapterId },
    });

    // Curso sem nenhuma aula publicada não pode continuar publicado.
    const publishedChaptersInCourse = await db.chapter.findMany({
      where: { courseId: params.courseId, isPublished: true },
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: { id: params.courseId },
        data: { isPublished: false },
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log('[CHAPTER_ID_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
