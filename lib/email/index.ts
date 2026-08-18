/**
 * Adaptador de e-mail — Resend em produção, log no console em modo mock.
 *
 * Mesma filosofia dos outros adaptadores: em desenvolvimento você vê no
 * terminal exatamente o que seria enviado, sem precisar de conta nem de
 * domínio verificado.
 */

import { MOCK_MODE, config } from '@/lib/config';

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendOptions) {
  if (MOCK_MODE || !process.env.RESEND_API_KEY) {
    console.log('\n─── E-MAIL (simulado) ─────────────────────');
    console.log(`Para:     ${to}`);
    console.log(`Assunto:  ${subject}`);
    console.log('───────────────────────────────────────────\n');
    return { simulated: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || `${config.company.name} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    // E-mail não pode derrubar a compra. Registra e segue.
    console.error('[RESEND]', await res.text());
    return { error: true };
  }

  return res.json();
}

/* -------------------------------------------------------------------------- */
/* Modelos                                                                     */
/* -------------------------------------------------------------------------- */

const wrap = (body: string) => `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
    <div style="height:3px;background:linear-gradient(to right,#10b981,#0d9488);border-radius:2px;margin-bottom:28px"></div>
    ${body}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px" />
    <p style="font-size:11px;color:#94a3b8;line-height:1.6">
      ${config.company.name}<br />
      <a href="mailto:${config.company.email}" style="color:#94a3b8">${config.company.email}</a>
    </p>
  </div>
`;

export function sendWelcome(to: string, name: string) {
  return send({
    to,
    subject: `Bem-vindo à ${config.company.name}`,
    html: wrap(`
      <h1 style="font-size:20px;margin:0 0 12px">Olá, ${name}!</h1>
      <p style="font-size:14px;line-height:1.7;color:#475569">
        Sua conta está pronta. Acesse o portal do aluno para começar.
      </p>
      <a href="${config.app.url}" style="display:inline-block;margin-top:20px;background:#059669;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px">
        Entrar na plataforma
      </a>
    `),
  });
}

export function sendPurchaseConfirmation(
  to: string,
  name: string,
  courseTitle: string,
  courseId: string
) {
  return send({
    to,
    subject: `Matrícula confirmada — ${courseTitle}`,
    html: wrap(`
      <h1 style="font-size:20px;margin:0 0 12px">Matrícula confirmada!</h1>
      <p style="font-size:14px;line-height:1.7;color:#475569">
        ${name}, seu acesso a <strong>${courseTitle}</strong> está liberado.
      </p>
      <a href="${config.app.url}/courses/${courseId}" style="display:inline-block;margin-top:20px;background:#059669;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px">
        Começar o curso
      </a>
    `),
  });
}

export function sendCertificate(
  to: string,
  name: string,
  courseTitle: string,
  courseId: string
) {
  return send({
    to,
    subject: `Seu certificado — ${courseTitle}`,
    html: wrap(`
      <h1 style="font-size:20px;margin:0 0 12px">Parabéns, ${name}!</h1>
      <p style="font-size:14px;line-height:1.7;color:#475569">
        Você concluiu <strong>${courseTitle}</strong>. Seu certificado já
        pode ser emitido.
      </p>
      <a href="${config.app.url}/api/student/certificate/${courseId}" style="display:inline-block;margin-top:20px;background:#d97706;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px">
        Emitir certificado
      </a>
    `),
  });
}
