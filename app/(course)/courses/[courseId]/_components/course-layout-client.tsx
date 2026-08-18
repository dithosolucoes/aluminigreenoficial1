'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

interface CourseLayoutClientProps {
  children: React.ReactNode;
  courseNavbar: React.ReactNode;
  courseSidebar: React.ReactNode;
  courseId: string;
}

export const CourseLayoutClient = ({
  children,
  courseNavbar,
  courseSidebar,
  courseId,
}: CourseLayoutClientProps) => {
  const pathname = usePathname();
  // Check if we are precisely on the landing/sales page (e.g. /courses/course-uuid)
  const isLandingPage = pathname === `/courses/${courseId}`;

  if (isLandingPage) {
    return (
      <div className="h-full bg-slate-50/40 min-h-screen flex flex-col antialiased">
        <div className="h-[80px] fixed top-0 inset-x-0 w-full z-50">
          {courseNavbar}
        </div>
        <main className="pt-[80px] flex-grow flex flex-col h-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        {courseNavbar}
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        {courseSidebar}
      </div>
      <main className="md:pl-80 pt-[80px] h-full bg-slate-50/20">
        {children}
      </main>
    </div>
  );
};
