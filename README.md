# Alumini Green — Plataforma de Cursos

Plataforma de venda e consumo de cursos online. Next.js 13 (App Router),
Prisma + PostgreSQL, Tailwind.

---

## Estado atual

O sistema está **completo e navegável em modo simulado**. Login, vídeo e
pagamento funcionam de ponta a ponta sem nenhuma conta externa criada.

Quando as contas reais existirem, muda-se **uma variável** — nenhuma linha de
código.

| Camada | Simulado (hoje) | Real (depois) |
|---|---|---|
| Login | Perfis de teste selecionáveis | Clerk |
| Vídeo | MP4 de demonstração | Bunny Stream |
| Cartão | Checkout simulado | Stripe (até 12x) |
| Pix | Checkout simulado | Mercado Pago |
| E-mail | — | Resend |
| Banco | PostgreSQL | PostgreSQL (Railway) |

---

## Rodando localmente

**Pré-requisitos:** Node 18+ e um PostgreSQL acessível.

```bash
# 1. dependências
npm install

# 2. variáveis de ambiente
cp .env.example .env
#    preencha apenas DATABASE_URL — o resto pode ficar vazio em modo mock

# 3. criar as tabelas
npx prisma generate
npx prisma migrate dev --name init

# 4. popular com dados de demonstração
npx tsx scripts/seed.ts

# 5. subir
npm run dev
```

Abra <http://localhost:3000>. Você cai na **landing page** como visitante.

### Perfis de teste

Em `/sign-in` escolha um dos três. Dá para trocar a qualquer momento pelo menu
no canto superior direito.

| Perfil | Papel | Serve para testar |
|---|---|---|
| Equipe Alumini Green | Professor | Criar cursos, gerir alunos, financeiro |
| Ana Souza | Aluna | Já comprou 2 cursos e tem progresso |
| Bruno Lima | Aluno | Não comprou nada — vê tudo bloqueado |

---

## Ligando os serviços reais

1. Criar as contas:
   - Banco e hospedagem — <https://railway.app>
   - Login — <https://clerk.com>
   - Vídeo — <https://bunny.net> (ativar o **Stream**, não só o CDN)
   - Cartão — <https://dashboard.stripe.com>
   - Pix — <https://www.mercadopago.com.br/developers>
   - E-mail — <https://resend.com>
   - Anexos — <https://uploadthing.com>

2. Preencher as chaves no `.env` (o arquivo `.env.example` diz onde achar cada uma).

3. Trocar:
   ```env
   NEXT_PUBLIC_MOCK_MODE="false"
   ```

4. Definir `NEXT_PUBLIC_TEACHER_ID` com o ID do usuário administrador no Clerk.

> **Atenção ao Pix:** na Stripe, o Pix é liberado sob convite para empresas
> sediadas no Brasil. Solicite o acesso assim que abrir a conta. Enquanto não
> sair, mantenha `NEXT_PUBLIC_PIX_ENABLED="false"` — o cartão via Stripe
> continua funcionando normalmente.

---

## Arquitetura

O que permite a troca sem refatoração:

```
lib/config.ts          → decide simulado ou real (única fonte da verdade)
lib/auth/              → auth(), currentUser(), isTeacher()
lib/video/             → createVideo(), deleteVideo(), getPlaybackUrl()
lib/payment/           → createCheckout(), confirmPayment(), hasAccess()
```

Nenhum arquivo fora de `lib/` importa `@clerk/nextjs`, o SDK do Bunny ou o do
Stripe diretamente. Se algum passar a importar, a troca deixa de ser
configuração — é a regra que sustenta o resto.

O fluxo de pagamento simulado percorre os mesmos estados do real
(`PENDING` → webhook → `PAID`), de propósito: o caminho já está construído e
testado quando as chaves entrarem.

---

## Funcionalidades

**Aluno:** catálogo com busca e filtro por categoria · compra com cartão
parcelado ou Pix · player com marcação de progresso · primeira aula liberada
como degustação · dúvidas por aula · certificado ao concluir 100% · histórico
de pagamentos com recibo.

**Professor:** criar e publicar cursos e aulas · reordenar por arrastar ·
upload de capa, anexos e vídeo · gestão de alunos (matricular, suspender,
revogar) · painel financeiro · métricas de venda.
