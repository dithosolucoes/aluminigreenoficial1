import { auth, currentUser, isTeacher } from '@/lib/auth';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export async function GET(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        id: params.purchaseId,
      },
      include: {
        course: true,
      },
    });

    if (!purchase) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // O recibo é do dono da compra. Professor pode ver o de qualquer aluno.
    if (purchase.userId !== userId && !isTeacher(userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const buyer = await db.user.findUnique({ where: { id: purchase.userId } });
    const userEmail = buyer?.email || "—";
    const userName = buyer?.name || "Aluno";

    const METHOD_LABEL: Record<string, string> = {
      CARD: "Cartão de crédito",
      PIX: "Pix",
      BOLETO: "Boleto bancário",
      NONE: "Matrícula manual",
    };
    const PROVIDER_LABEL: Record<string, string> = {
      STRIPE: "Pago via Stripe",
      MERCADOPAGO: "Pago via Mercado Pago",
      MANUAL: "Cortesia / matrícula manual",
      MOCK: "Ambiente de demonstração",
    };
    const methodLabel = METHOD_LABEL[purchase.method] ?? purchase.method;
    const providerLabel = PROVIDER_LABEL[purchase.provider] ?? purchase.provider;
    const installmentLabel =
      purchase.installments > 1 ? ` em ${purchase.installments}x` : "";

    const invoiceId = `INV-${purchase.id.substring(0, 8).toUpperCase()}`;
    const formattedDate = new Date(purchase.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Recibo Alumini Green - ${invoiceId}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @media print {
            .no-print { display: none !important; }
            body { background-color: white !important; }
          }
        </style>
      </head>
      <body class="bg-slate-50 min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div class="max-w-2xl w-full bg-white shadow-xl rounded-lg border border-slate-100 overflow-hidden">
          <div class="h-2 bg-emerald-600"></div>

          <div class="p-8">
            <div class="flex justify-between items-center mb-8 no-print">
              <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Recibo Oficial</span>
              <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded transition flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir ou Salvar PDF
              </button>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <h1 class="text-xl font-bold text-slate-800">${config.company.name}</h1>
                <p class="text-xs text-slate-400 font-medium">Plataforma de Ensino e Sustentabilidade</p>
                ${config.company.cnpj ? `<p class="text-xs text-slate-500 mt-2">CNPJ: ${config.company.cnpj}</p>` : ""}
                <p class="text-xs text-slate-500">${config.company.email}</p>
              </div>
              <div class="text-left md:text-right">
                <div class="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded inline-block uppercase tracking-wider mb-2">${providerLabel}</div>
                <p class="text-sm font-mono text-slate-600">ID: <span class="font-bold text-slate-800">${invoiceId}</span></p>
                <p class="text-[11px] text-slate-400 mt-1">Gerado em ${formattedDate}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6 mb-6">
              <div>
                <h3 class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Faturado Para:</h3>
                <p class="text-sm font-bold text-slate-800">${userName}</p>
                <p class="text-xs text-slate-500 mt-1">${userEmail}</p>
                <p class="text-[11px] text-slate-400">ID Usuário: ${purchase.userId}</p>
              </div>
              <div>
                <h3 class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Detalhes do Pagamento:</h3>
                <p class="text-xs text-slate-600"><span class="font-semibold">Transação:</span> ${purchase.externalId || "—"}</p>
                <p class="text-xs text-slate-600"><span class="font-semibold">Forma:</span> ${methodLabel}${installmentLabel}</p>
                <p class="text-xs text-slate-600"><span class="font-semibold">Status:</span> ${purchase.status === "PAID" ? "Pago" : purchase.status}</p>
              </div>
            </div>

            <div class="mb-8">
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b border-slate-200 text-xs text-slate-400 uppercase tracking-wider">
                    <th class="pb-3 font-semibold">Descrição do Serviço / Licença</th>
                    <th class="pb-3 text-right font-semibold">Quantidade</th>
                    <th class="pb-3 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td class="py-4">
                      <p class="font-bold text-slate-800">${purchase.course.title}</p>
                      <p class="text-xs text-slate-400">Acesso vitalício à plataforma e material didático.</p>
                    </td>
                    <td class="py-4 text-right text-slate-600">1</td>
                    <td class="py-4 text-right font-semibold text-slate-800">${formatPrice(purchase.amount || purchase.course.price || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end border-t border-slate-100 pt-6">
              <div class="w-64 space-y-2">
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>${formatPrice(purchase.amount || purchase.course.price || 0)}</span>
                </div>
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Impostos (ISS/COFINS)</span>
                  <span class="text-emerald-600 font-medium">R$ 0,00 (Isento)</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-100 pt-2">
                  <span>Total Geral</span>
                  <span class="text-emerald-700">${formatPrice(purchase.amount || purchase.course.price || 0)}</span>
                </div>
              </div>
            </div>

            <div class="mt-12 border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400 leading-relaxed">
              <p>Este documento serve como comprovante de transação eletrônica emitida por Alumini Green.</p>
              <p class="mt-1">Para suporte ou dúvidas, entre em contato em <strong>${config.company.email}</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.log("[INVOICE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
