import { auth, currentUser, isTeacher } from '@/lib/auth';
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StudentsClient } from "./_components/students-client";

export default async function TeacherStudentsPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const user = await currentUser();
  if (!isTeacher(userId, user?.email)) {
    return redirect("/");
  }


  // Fetch all published courses to populate the enrollment select list
  const courses = await db.course.findMany({
    include: {
      chapters: {
        where: {
          isPublished: true
        }
      }
    },
    orderBy: {
      title: "asc"
    }
  });

  // Fetch all real purchases to build a list of actual enrolled students
  const purchases = await db.purchase.findMany({
    where: {
      status: "PAID",
    },
    include: {
      user: true,
      course: {
        include: {
          chapters: {
            where: {
              isPublished: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Fetch user progress to compute completion rate of real students
  const progressRecords = await db.userProgress.findMany({
    where: {
      isCompleted: true
    }
  });

  return (
    <div className="p-6">
      <StudentsClient 
        initialCourses={courses} 
        initialPurchases={purchases}
        progressRecords={progressRecords}
        currentUserId={userId}
      />
    </div>
  );
}
