import { auth, currentUser, isTeacher } from '@/lib/auth';
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Percent
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";

export default async function TeacherFinancePage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const user = await currentUser();
  if (!isTeacher(userId, user?.email)) {
    return redirect("/");
  }


  // Transações dos cursos deste professor, com o comprador e o estado real
  // da cobrança. PENDING fica de fora do faturamento.
  const dbPurchases = await db.purchase.findMany({
    where: {
      course: { userId },
      status: { in: ["PAID", "REFUNDED"] },
    },
    include: {
      course: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const METHOD_LABEL: Record<string, string> = {
    CARD: "Cartão de Crédito",
    PIX: "Pix",
    BOLETO: "Boleto Bancário",
    NONE: "Cortesia / Manual",
  };

  const transactions = dbPurchases.map((purchase) => ({
    id: `tx-${purchase.id.substring(0, 8)}`,
    studentName: purchase.user?.name ?? "Aluno removido",
    studentEmail: purchase.user?.email ?? "—",
    courseTitle: purchase.course.title,
    // Valor efetivamente cobrado, não o preço atual do curso.
    amount: purchase.amount || purchase.course.price || 0,
    date: (purchase.paidAt ?? purchase.createdAt).toISOString(),
    method: METHOD_LABEL[purchase.method] ?? purchase.method,
    status: purchase.status === "REFUNDED" ? "Reembolsado" : "Pago",
    externalId: purchase.externalId ?? "—",
    provider: purchase.provider,
    purchaseId: purchase.id,
  }));


  // Financial calculations
  const totalGrossBilling = transactions
    .filter((tx) => tx.status === "Pago")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRefunded = transactions
    .filter((tx) => tx.status === "Reembolsado")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Estimativa sobre o que passou por gateway. Matrícula manual (provider
  // MANUAL) não tem taxa, então fica de fora do cálculo.
  const gatewayBilling = transactions
    .filter((tx) => tx.status === "Pago" && tx.provider !== "MANUAL")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalStripeFees = gatewayBilling * 0.042;
  const netIncome = totalGrossBilling - totalRefunded - totalStripeFees;

  const averageTicket = totalGrossBilling / (transactions.filter((tx) => tx.status === "Pago").length || 1);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Painel Financeiro
          </h1>
          <p className="text-slate-500 mt-1">
            Faturamento, taxas estimadas de gateway e conciliação de recibos.
          </p>
        </div>
        <div className="flex items-center gap-x-2 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-800 text-xs font-semibold shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          Faturamento consolidado
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Faturamento Bruto */}
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Bruta</CardTitle>
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-950">{formatPrice(totalGrossBilling)}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">100%</span> das faturas consolidadas
            </p>
          </CardContent>
        </Card>

        {/* Deduções de Taxa Stripe */}
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxas de Checkout (Stripe)</CardTitle>
            <div className="p-1 rounded-md bg-slate-100 text-slate-500">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-950">{formatPrice(totalStripeFees)}</div>
            <p className="text-xs text-slate-400 mt-1">Estimado (~4.2% do faturamento)</p>
          </CardContent>
        </Card>

        {/* Reembolsos */}
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reembolsos & Estornos</CardTitle>
            <div className="p-1 rounded-md bg-rose-50 text-rose-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-950">{formatPrice(totalRefunded)}</div>
            <p className="text-xs text-slate-400 mt-1">Devoluções solicitadas</p>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card className="border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/20 to-emerald-50/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Faturamento Líquido</CardTitle>
            <div className="p-1 rounded-md bg-emerald-600 text-white">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-950">{formatPrice(netIncome)}</div>
            <p className="text-xs text-emerald-700 mt-1 font-medium">Líquido a ser transferido à conta</p>
          </CardContent>
        </Card>
      </div>

      {/* Average Order Value widget banner */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white">
        <div className="p-4 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance de Vendas</p>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                Ticket Médio Geral: <span className="text-emerald-700 font-extrabold">{formatPrice(averageTicket)}</span>
              </h3>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Métricas atualizadas em tempo real com base nas últimas {transactions.length} transações.
          </div>
        </div>
      </Card>

      {/* Transaction table list */}
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Histórico de Transações Consolidadas</CardTitle>
          <CardDescription>
            Logs completos de pagamentos via API Stripe. Use os links de recibo para emitir comprovantes oficiais.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Transação ID</TableHead>
                <TableHead>Aluno / Comprador</TableHead>
                <TableHead>Curso Adquirido</TableHead>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Stripe ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center w-[120px]">Recibo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const dateFormatted = new Date(tx.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });
                return (
                  <TableRow key={tx.id} className="hover:bg-slate-50/30">
                    <TableCell className="font-mono text-xs text-slate-500 font-semibold uppercase">{tx.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800 text-xs">{tx.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{tx.studentEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700 text-xs">{tx.courseTitle}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">{dateFormatted}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {tx.method}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-400">
                      <a 
                        href="https://dashboard.stripe.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:text-emerald-600 hover:underline inline-flex items-center gap-x-0.5"
                      >
                        {tx.externalId.substring(0, 18)} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        tx.status === "Pago" 
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 text-[10px] font-bold"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 text-[10px] font-bold"
                      }>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-slate-950 text-xs">
                      {formatPrice(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <a 
                          href={`/api/student/invoice/${tx.purchaseId}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                          title="Ver Fatura"
                        >
                          <Download className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
