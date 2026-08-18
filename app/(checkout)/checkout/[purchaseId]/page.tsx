import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { MOCK_MODE } from '@/lib/config';

import { MockCheckout } from './_components/mock-checkout';

/**
 * Tela de checkout simulada.
 *
 * Imita a página do provedor: escolha de método, resumo do valor, confirmar
 * ou cancelar. Ao confirmar, chama o webhook — exatamente como o Stripe ou o
 * Mercado Pago fariam. É esse caminho completo que precisa estar construído
 * e testado antes das chaves reais entrarem.
 */
const CheckoutPage = async ({
  params,
}: {
  params: { purchaseId: string };
}) => {
  if (!MOCK_MODE) return redirect('/');

  const { userId } = auth();
  if (!userId) return redirect('/sign-in');

  const purchase = await db.purchase.findUnique({
    where: { id: params.purchaseId },
    include: { course: true },
  });

  if (!purchase) return redirect('/');
  // Ninguém paga a compra de outra pessoa.
  if (purchase.userId !== userId) return redirect('/');

  if (purchase.status === 'PAID') {
    return redirect(`/courses/${purchase.courseId}?success=1`);
  }

  return (
    <MockCheckout
      purchaseId={purchase.id}
      externalId={purchase.externalId ?? ''}
      courseId={purchase.courseId}
      courseTitle={purchase.course.title}
      amount={purchase.amount}
      method={purchase.method}
      installments={purchase.installments}
    />
  );
};

export default CheckoutPage;
