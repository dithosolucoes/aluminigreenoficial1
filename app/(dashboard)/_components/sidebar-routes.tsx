"use client";

import { BarChart, Compass, Layout, List, Users, CreditCard, Wallet, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { useSession } from "@/components/auth/session-provider";
import { SidebarItem } from "./sidebar-item";

const guestRoutes = [
  {
    icon: Layout,
    label: "Meus Cursos",
    href: "/",
  },
  {
    icon: Compass,
    label: "Explorar Cursos",
    href: "/search",
  },
  {
    icon: Wallet,
    label: "Meus Pagamentos",
    href: "/student/payments",
  },
];

const teacherRoutes = [
  {
    icon: List,
    label: "Gerenciar Cursos",
    href: "/teacher/courses",
  },
  {
    icon: Users,
    label: "Gerenciar Alunos",
    href: "/teacher/students",
  },
  {
    icon: CreditCard,
    label: "Financeiro",
    href: "/teacher/finance",
  },
  {
    icon: BarChart,
    label: "Métricas de Vendas",
    href: "/teacher/analytics",
  },
  {
    icon: BookOpen,
    label: "Catálogo de Cursos",
    href: "/search",
  },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const session = useSession();

  const isTeacherRoute = pathname?.startsWith("/teacher");
  // Se estiver numa rota /teacher OU for professor navegando no painel
  const isTeacherMode = isTeacherRoute || (session.isTeacher && pathname !== "/search" && pathname !== "/student/payments");

  const routes = isTeacherMode ? teacherRoutes : guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
