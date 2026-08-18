import { db } from '@/lib/db';
import { Attachment, Chapter } from '@prisma/client';

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChaper = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // Antes bastava a linha existir. Agora exige pagamento confirmado
    // e matrícula não suspensa — o mesmo critério de lib/payment.
    const isPurchaseActive =
      !!purchase && purchase.status === 'PAID' && !purchase.isSuspended;

    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
      },
      select: {
        price: true,
      },
    });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    if (!chapter || !course) {
      throw new Error('Chapter or Course not found');
    }

    let videoAsset = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (isPurchaseActive) {
      attachments = await db.attachment.findMany({
        where: {
          courseId,
        },
      });
    }

    if (chapter.isFree || isPurchaseActive) {
      videoAsset = await db.videoAsset.findUnique({
        where: {
          chapterId,
        },
      });

      nextChapter = await db.chapter.findFirst({
        where: {
          courseId,
          isPublished: true,
          position: {
            gt: chapter?.position,
          },
        },
        orderBy: {
          position: 'asc',
          },
        });
      }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    return {
      chapter,
      course,
      videoAsset,
      attachments,
      nextChapter,
      userProgress,
      purchase: isPurchaseActive ? purchase : null,
    };
  } catch (error) {
    console.log('[GET_CHAPTER]', error);
    return {
      chapter: null,
      course: null,
      videoAsset: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
