import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

import { PixWaiting } from './_components/pix-waiting';

/**
 * Tela de espera do Pix (modo real).
 *
 * O Mercado Pago devolve o QR Code na criação da cobrança, mas a confirmação
 * chega depois, por webhook. Esta página exibe o código e fica consultando o
 * estado da compra até virar PAID.
 */
const PixCheckoutPage = async ({
  params,
}: {
  params: { purchaseId: string };
}) => {
  const { userId } = auth();
  if (!userId) return redirect('/sign-in');

  const purchase = await db.purchase.findUnique({
    where: { id: params.purchaseId },
    include: { course: true },
  });

  if (!purchase) return redirect('/');
  if (purchase.userId !== userId) return redirect('/');

  if (purchase.status === 'PAID') {
    return redirect(`/courses/${purchase.courseId}?success=1`);
  }

  return (
    <PixWaiting
      purchaseId={purchase.id}
      courseId={purchase.courseId}
      courseTitle={purchase.course.title}
      amount={purchase.amount}
    />
  );
};

export default PixCheckoutPage;
