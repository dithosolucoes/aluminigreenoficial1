import { NextResponse } from 'next/server';

import { auth, isTeacher } from '@/lib/auth';
import { grantManualAccess } from '@/lib/payment';
import { db } from '@/lib/db';

/**
 * Matrícula manual dada pelo professor.
 *
 * Duas formas:
 *  · targetUserId  → matricula um usuário que já existe
 *  · name + email  → cria o aluno e matricula
 *
 * O acesso é concedido por grantManualAccess(), que grava a compra já como
 * PAID. Antes a linha nascia PENDING e o aluno ficava matriculado sem
 * conseguir assistir.
 */
export async function POST(req: Request) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId || !isTeacher(currentUserId)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { targetUserId, courseId, name, email } = await req.json();

    if (!courseId) {
      return new NextResponse('Curso é obrigatório', { status: 400 });
    }
    if (!targetUserId && !email) {
      return new NextResponse('Informe o aluno ou um e-mail', { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) return new NextResponse('Curso não encontrado', { status: 404 });

    /* ------------------------------------------------------------------ */
    /* Resolver o aluno                                                    */
    /* ------------------------------------------------------------------ */
    let student = targetUserId
      ? await db.user.findUnique({ where: { id: targetUserId } })
      : null;

    if (!student && email) {
      const cleanEmail = String(email).trim().toLowerCase();

      // E-mail já cadastrado? Reaproveita em vez de duplicar.
      student = await db.user.findUnique({ where: { email: cleanEmail } });

      if (!student) {
        student = await db.user.create({
          data: {
            // Prefixo `manual_` distingue de um ID vindo do Clerk. Quando o
            // aluno criar conta de verdade, o e-mail permite reconciliar.
            id: `manual_${crypto.randomUUID()}`,
            email: cleanEmail,
            name: String(name || '').trim() || cleanEmail.split('@')[0],
            role: 'STUDENT',
          },
        });
      }
    }

    if (!student) {
      return new NextResponse('Aluno não encontrado', { status: 404 });
    }

    /* ------------------------------------------------------------------ */
    /* Matricular                                                          */
    /* ------------------------------------------------------------------ */
    const existing = await db.purchase.findUnique({
      where: { userId_courseId: { userId: student.id, courseId } },
    });

    if (existing && existing.status === 'PAID' && !existing.isSuspended) {
      return new NextResponse('Este aluno já está matriculado neste curso', {
        status: 400,
      });
    }

    const purchase = await grantManualAccess(student.id, courseId);

    // Reativa se estava suspenso.
    if (purchase.isSuspended) {
      await db.purchase.update({
        where: { id: purchase.id },
        data: { isSuspended: false },
      });
    }

    return NextResponse.json({ purchase, student });
  } catch (error) {
    console.log('[TEACHER_STUDENTS_ENROLL]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
