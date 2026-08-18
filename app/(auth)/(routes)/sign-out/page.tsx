import { SignOutScreen } from '@/components/auth/sign-out-screen';
import { MOCK_MODE } from '@/lib/config';

export default function Page() {
  return <SignOutScreen mockMode={MOCK_MODE} />;
}
