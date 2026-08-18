"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  UserPlus, 
  GraduationCap, 
  Trash2, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Loader2, 
  HelpCircle,
  TrendingUp,
  Mail,
  UserCheck,
  Eye,
  Ban,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

// Let's declare interface types
interface Chapter {
  id: string;
  title: string;
  isPublished: boolean;
}

interface Course {
  id: string;
  title: string;
  price: number | null;
  isPublished: boolean;
  chapters: Chapter[];
}

interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  isSuspended: boolean;
  createdAt: Date | string;
  course: Course;
  user: { id: string; name: string; email: string } | null;
}

interface ProgressRecord {
  id: string;
  userId: string;
  chapterId: string;
  isCompleted: boolean;
}

interface StudentsClientProps {
  initialCourses: Course[];
  initialPurchases: Purchase[];
  progressRecords: ProgressRecord[];
  currentUserId: string;
}

export const StudentsClient = ({
  initialCourses,
  initialPurchases,
  progressRecords,
  currentUserId
}: StudentsClientProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);

  // Form states for manual enrollment
  const [enrollType, setEnrollType] = useState<"self" | "custom">("self");
  const [customStudentName, setCustomStudentName] = useState("");
  const [customStudentEmail, setCustomStudentEmail] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Build list of students combining real and preset mock ones
  // We'll compute the progress of real students dynamically based on DB progress records
  const getStudentList = () => {
    const list: any[] = [];

    // Process real database purchases
    initialPurchases.forEach((purchase) => {
      // Find completed chapters for this user in this course
      const courseChapters = purchase.course.chapters || [];
      const chapterIds = courseChapters.map((c) => c.id);
      
      const completedCount = progressRecords.filter(
        (p) => p.userId === purchase.userId && chapterIds.includes(p.chapterId)
      ).length;

      const totalChapters = chapterIds.length || 1; // avoid division by zero
      const progressPercent = Math.round((completedCount / totalChapters) * 100);

      const isCurrentUser = purchase.userId === currentUserId;

      const chaptersWithCompletion = courseChapters.map((ch) => {
        const isCompleted = progressRecords.some(
          (p) => p.userId === purchase.userId && p.chapterId === ch.id
        );
        return {
          id: ch.id,
          title: ch.title,
          isCompleted,
        };
      });

      list.push({
        id: purchase.userId,
        purchaseId: purchase.id,
        name: purchase.user?.name ?? "Aluno removido",
        email: purchase.user?.email ?? "—",
        courseId: purchase.courseId,
        courseTitle: purchase.course.title,
        joinedDate: new Date(purchase.createdAt).toISOString().split("T")[0],
        progressPercent: Math.min(progressPercent, 100),
        completedChapters: completedCount,
        totalChapters: totalChapters,
        status: purchase.isSuspended ? "Suspenso" : "Ativo",
        isSuspended: purchase.isSuspended,
        chapters: chaptersWithCompletion
      });
    });

    return list;
  };

  const students = getStudentList();

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const query = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.courseTitle.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const totalStudentsCount = new Set(students.map((s) => s.id)).size;
  const averageProgress = Math.round(
    students.reduce((acc, curr) => acc + curr.progressPercent, 0) / (students.length || 1)
  );
  const activeLicenses = students.length;

  // Handle manual enrollment form submission
  const onEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error("Por favor, selecione um curso.");
      return;
    }

    try {
      setIsLoading(true);

      if (enrollType === "custom" && !customStudentEmail.trim()) {
        toast.error("Informe o e-mail do aluno.");
        setIsLoading(false);
        return;
      }

      // Aluno novo é criado pela API a partir do nome e e-mail. Antes um ID
      // aleatório era inventado aqui, o que agora violaria a chave estrangeira.
      await axios.post("/api/teacher/students/enroll", {
        courseId: selectedCourseId,
        ...(enrollType === "self"
          ? { targetUserId: currentUserId }
          : { name: customStudentName, email: customStudentEmail }),
      });

      toast.success(
        enrollType === "self"
          ? "Matrícula realizada com sucesso! Você agora tem acesso de aluno a este curso."
          : `Aluno matriculado com sucesso!`
      );

      // Clean form states
      setCustomStudentName("");
      setCustomStudentEmail("");
      setSelectedCourseId("");
      setIsEnrollOpen(false);
      
      // Refresh database records
      router.refresh();
    } catch (error: any) {
      const errorMsg = error?.response?.data || "Ocorreu um erro ao matricular o aluno";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke/cancel enrollment
  const onRevokeAccess = async (targetUserId: string, courseId: string) => {
    try {
      setRevokingId(`${targetUserId}-${courseId}`);
      await axios.post("/api/teacher/students/revoke", {
        targetUserId,
        courseId
      });

      toast.success("Inscrição cancelada e acesso revogado!");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao revogar acesso do aluno.");
    } finally {
      setRevokingId(null);
    }
  };

  // Toggle student suspension
  const onToggleSuspend = async (targetUserId: string, courseId: string) => {
    try {
      setSuspendingId(`${targetUserId}-${courseId}`);
      await axios.post("/api/teacher/students/toggle-suspend", {
        targetUserId,
        courseId
      });

      toast.success("Status de acesso do aluno atualizado!");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao alterar acesso do aluno.");
    } finally {
      setSuspendingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page header and primary actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Gerenciamento de Alunos
          </h1>
          <p className="text-slate-500 mt-1">
            Veja o progresso de aprendizagem, matricule novos alunos ou gerencie as licenças ativas do seu LMS.
          </p>
        </div>

        {/* Modal Form to Enroll Students */}
        <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-x-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Matricular Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[460px] bg-white border border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">Nova Matrícula Manual</DialogTitle>
              <DialogDescription className="text-slate-500">
                Adicione um aluno diretamente a um curso. Se matricular a si mesmo, o curso ficará visível na sua seção &quot;Meus Cursos&quot;.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onEnrollSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Destinatário</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={enrollType === "self" ? "default" : "outline"}
                    className={enrollType === "self" ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs" : "text-xs"}
                    onClick={() => setEnrollType("self")}
                  >
                    <UserCheck className="h-4 w-4 mr-1.5" />
                    Eu mesmo (Admin)
                  </Button>
                  <Button
                    type="button"
                    variant={enrollType === "custom" ? "default" : "outline"}
                    className={enrollType === "custom" ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs" : "text-xs"}
                    onClick={() => setEnrollType("custom")}
                  >
                    <Mail className="h-4 w-4 mr-1.5" />
                    Outro Estudante
                  </Button>
                </div>
              </div>

              {enrollType === "custom" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Nome Completo</label>
                    <Input
                      required
                      placeholder="Ex: Pedro Henrique Souza"
                      value={customStudentName}
                      onChange={(e) => setCustomStudentName(e.target.value)}
                      className="bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Endereço de E-mail</label>
                    <Input
                      required
                      type="email"
                      placeholder="Ex: pedro.souza@exemplo.com"
                      value={customStudentEmail}
                      onChange={(e) => setCustomStudentEmail(e.target.value)}
                      className="bg-white text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Selecionar Curso</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Escolha um Curso --</option>
                  {initialCourses
                    .filter((c) => c.isPublished)
                    .map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} {course.price ? `(${course.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})` : "(Gratuito)"}
                      </option>
                    ))}
                </select>
                {initialCourses.filter(c => c.isPublished).length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Aviso: Crie e publique pelo menos um curso para poder matricular manualmente.
                  </p>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEnrollOpen(false)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || initialCourses.filter(c => c.isPublished).length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Confirmar Matrícula
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Alunos</CardTitle>
            <Users className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalStudentsCount}</div>
            <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% novos este mês
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Licenças / Matrículas</CardTitle>
            <GraduationCap className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{activeLicenses}</div>
            <p className="text-xs text-slate-400 mt-1">Cursos atualmente acessados</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progresso Médio</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{averageProgress}%</div>
            <p className="text-xs text-slate-400 mt-1">Taxa de conclusão dos módulos</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Data Grid & Search Filter */}
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Alunos Ativos</CardTitle>
              <CardDescription>Alunos matriculados, com progresso calculado a partir das aulas concluídas.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filtrar por nome, email ou curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-700 transition"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Nenhum aluno encontrado</p>
              <p className="text-xs text-slate-400 mt-0.5">Tente usar outros termos de busca ou filtre por cursos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead>Estudante</TableHead>
                    <TableHead>Curso Matriculado</TableHead>
                    <TableHead>Data de Ingresso</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const isRevoking = revokingId === `${student.id}-${student.courseId}`;
                    const isSuspending = suspendingId === `${student.id}-${student.courseId}`;
                    const isSuspended = student.isSuspended;

                    return (
                      <TableRow key={`${student.id}-${student.courseId}`} className="hover:bg-slate-50/40">
                        <TableCell>
                          <div className="flex items-center gap-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {student.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-slate-800 flex items-center gap-x-2">
                                {student.name}
                                {student.id === currentUserId && (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] font-medium py-0 px-1.5 uppercase font-mono">Você</Badge>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-x-1 mt-0.5">
                                <Mail className="h-3 w-3 inline text-slate-300" />
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-700 text-xs">{student.courseTitle}</span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {student.joinedDate}
                        </TableCell>
                        <TableCell className="w-[180px]">
                          <div className="flex flex-col gap-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                              <span>{student.progressPercent}% concluído</span>
                              <span className="text-slate-400 font-mono">{student.completedChapters}/{student.totalChapters} caps</span>
                            </div>
                            <Progress value={student.progressPercent} className="h-1.5 bg-slate-100" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-x-1 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                              <Ban className="h-3 w-3" />
                              Suspenso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-x-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle className="h-3 w-3" />
                              Ativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudentDetail(student)}
                              className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 h-8 w-8 rounded-md transition"
                              title="Ver Ficha do Aluno"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSuspending}
                              onClick={() => onToggleSuspend(student.id, student.courseId)}
                              className={`p-2 h-8 w-8 rounded-md transition ${
                                isSuspended 
                                  ? "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" 
                                  : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              }`}
                              title={isSuspended ? "Reativar Acesso" : "Suspender Acesso"}
                            >
                              {isSuspending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                              ) : isSuspended ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isRevoking}
                              onClick={() => onRevokeAccess(student.id, student.courseId)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 h-8 w-8 rounded-md transition"
                              title="Revogar Acesso / Desmatricular"
                            >
                              {isRevoking ? (
                                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Ficha do Aluno Modal */}
      <Dialog open={!!selectedStudentDetail} onOpenChange={(open) => !open && setSelectedStudentDetail(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white border border-slate-200 max-h-[90vh] overflow-y-auto">
          {selectedStudentDetail && (
            <>
              <DialogHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-inner">
                    {selectedStudentDetail.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-x-2">
                      {selectedStudentDetail.name}
                      {selectedStudentDetail.id === currentUserId && (
                        <Badge className="bg-emerald-600 text-white text-[9px] font-semibold py-0 px-1.5 uppercase">Você</Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs mt-0.5">
                      {selectedStudentDetail.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* General Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Curso</span>
                    <span className="text-slate-700 font-semibold block mt-0.5 truncate">{selectedStudentDetail.courseTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Data de Matrícula</span>
                    <span className="text-slate-700 font-semibold block mt-0.5">{selectedStudentDetail.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Status do Acesso</span>
                    <span className="mt-1 block">
                      {selectedStudentDetail.isSuspended ? (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] font-bold">Suspenso</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">Ativo</Badge>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Situação</span>
                    <span className="text-slate-700 font-medium block mt-0.5">
                      {selectedStudentDetail.isSuspended ? "Suspenso" : "Ativo"}
                    </span>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Progresso de Aprendizado</span>
                    <span className="text-emerald-700 font-mono">{selectedStudentDetail.progressPercent}% Concluído</span>
                  </div>
                  <Progress value={selectedStudentDetail.progressPercent} className="h-2 bg-slate-100" />
                  <p className="text-[10px] text-slate-400">
                    O aluno assistiu {selectedStudentDetail.completedChapters} de um total de {selectedStudentDetail.totalChapters} capítulos disponíveis.
                  </p>
                </div>

                {/* Chapters List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-x-1.5">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Ficha de Aulas & Progresso por Capítulo
                  </h4>
                  <div className="border border-slate-100 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {selectedStudentDetail.chapters && selectedStudentDetail.chapters.length > 0 ? (
                      selectedStudentDetail.chapters.map((ch: any, idx: number) => (
                        <div key={ch.id || idx} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50 transition">
                          <div className="flex items-center gap-x-2.5 max-w-[70%]">
                            <span className="text-[10px] font-mono text-slate-400 w-4 block text-right">{idx + 1}.</span>
                            <span className="text-slate-700 font-medium truncate">{ch.title}</span>
                          </div>
                          <div>
                            {ch.isCompleted ? (
                              <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[9px] font-semibold py-0.5 px-2 rounded-full border border-emerald-200">
                                Concluído
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-50 text-slate-400 text-[9px] font-semibold py-0.5 px-2 rounded-full border-slate-200">
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Nenhum capítulo disponível para visualização de progresso.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudentDetail(null)}
                  className="text-xs"
                >
                  Fechar Ficha
                </Button>
                <Button
                  disabled={suspendingId !== null}
                  onClick={async () => {
                    const originalDetail = selectedStudentDetail;
                    await onToggleSuspend(selectedStudentDetail.id, selectedStudentDetail.courseId);
                    // Update state modal to reflect toggle
                    setSelectedStudentDetail({
                      ...originalDetail,
                      isSuspended: !originalDetail.isSuspended,
                      status: !originalDetail.isSuspended ? "Suspenso" : "Ativo",
                      progressPercent: originalDetail.progressPercent,
                    });
                  }}
                  className={`text-xs text-white ${
                    selectedStudentDetail.isSuspended 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {suspendingId ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : selectedStudentDetail.isSuspended ? (
                    "Ativar Acesso"
                  ) : (
                    "Suspender Acesso"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};