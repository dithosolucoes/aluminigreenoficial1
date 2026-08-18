import { auth } from '@/lib/auth';
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { 
  CreditCard, 
  Receipt, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  Wallet,
  Calendar,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

// Client-side Receipt details button/modal is simulated elegantly 
const METHOD_LABEL: Record<string, string> = {
  CARD: "Cartão de crédito",
  PIX: "Pix",
  BOLETO: "Boleto",
  NONE: "Matrícula manual",
};

export default async function StudentPaymentsPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch purchases for this user
  const purchases = await db.purchase.findMany({
    where: {
      userId: userId,
      status: "PAID",
    },
    include: {
      course: {
        include: {
          category: true,
        }
      },
    },
    orderBy: {
      createdAt: "desc",
    }
  });

  // Forma de pagamento mais frequente entre as compras do aluno.
  const methodCounts = purchases.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + 1;
    return acc;
  }, {});
  const topMethod = (Object.entries(methodCounts) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const mostUsedMethod = topMethod
    ? METHOD_LABEL[topMethod[0]] ?? topMethod[0]
    : '—';

  // Usa o valor efetivamente cobrado na transação, não o preço atual do
  // curso — o preço pode ter mudado depois da compra.
  const totalSpent = purchases.reduce(
    (acc, p) => acc + (p.amount || p.course.price || 0),
    0
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header section with branding style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Meus Pagamentos
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie suas faturas, histórico de transações e assinaturas da Alumini Green.
          </p>
        </div>
        <div className="flex items-center gap-x-2 border border-emerald-100 bg-emerald-50/50 p-2 px-3 rounded-lg">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-800">Assinatura Ativa (Standard)</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Investido</CardTitle>
            <Wallet className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatPrice(totalSpent)}</div>
            <p className="text-xs text-slate-400 mt-1">Cursos adquiridos até o momento</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Inscrições Ativas</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{purchases.length}</div>
            <p className="text-xs text-slate-400 mt-1">Acesso vitalício garantido</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/30 to-emerald-50/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Forma de Pagamento</CardTitle>
            <CreditCard className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-950">
              {mostUsedMethod}
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              {purchases.length > 0
                ? "Forma mais usada nas suas compras"
                : "Nenhuma compra ainda"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Purchases History */}
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Histórico de Cobrança</CardTitle>
              <CardDescription>Visualize e baixe os recibos e faturas dos seus cursos.</CardDescription>
            </div>
            <Receipt className="h-5 w-5 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-400">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-700">Nenhuma compra encontrada</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Você ainda não adquiriu nenhum curso pago ou assinou planos adicionais.
              </p>
              <Link href="/search" className="mt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-x-2">
                  Ver Cursos Disponíveis <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[120px]">ID Fatura</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Data de Compra</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center w-[120px]">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => {
                  const invoiceId = `INV-${purchase.id.substring(0, 8).toUpperCase()}`;
                  return (
                    <TableRow key={purchase.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono text-xs text-slate-500 font-semibold">
                        {invoiceId}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800">{purchase.course.title}</div>
                        {purchase.course.category && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 mt-0.5 inline-block">
                            {purchase.course.category.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(purchase.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <div className="flex items-center gap-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          {METHOD_LABEL[purchase.method] ?? purchase.method}
                          {purchase.installments > 1 && ` · ${purchase.installments}x`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 text-[10px] font-semibold py-0.5 px-2">
                          Pago
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        {formatPrice(purchase.amount || purchase.course.price || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <a 
                          href={`/api/student/invoice/${purchase.id}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                          title="Visualizar Fatura Completa"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stripe Payment Method management simulation card */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/40 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Painel Financeiro Stripe</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Suas transações e dados bancários são processados com segurança de ponta a ponta pelo Stripe.
            </p>
          </div>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-x-1 shrink-0 font-medium bg-white px-3 py-1.5 border border-slate-200 rounded-md"
          >
            Acessar Portal do Stripe <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </Card>
    </div>
  );
}
