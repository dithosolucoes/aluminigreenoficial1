import { auth } from '@/lib/auth';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isTeacher } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId || !isTeacher(currentUserId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { targetUserId, courseId } = await req.json();

    // O professor só mexe em matrícula de curso que é dele.
    const owned = await db.course.findFirst({
      where: { id: courseId, userId: currentUserId },
      select: { id: true },
    });
    if (!owned) return new NextResponse("Forbidden", { status: 403 });

    if (!targetUserId || !courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if purchase exists
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: courseId,
        },
      },
    });

    if (!purchase) {
      return new NextResponse("Enrollment not found", { status: 404 });
    }

    // Toggle suspension state
    const updatedPurchase = await db.purchase.update({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: courseId,
        },
      },
      data: {
        isSuspended: !purchase.isSuspended,
      },
    });

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.log("[TEACHER_STUDENTS_TOGGLE_SUSPEND]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
