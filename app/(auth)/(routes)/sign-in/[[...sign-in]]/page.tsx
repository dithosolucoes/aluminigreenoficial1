import { SignIn } from '@clerk/nextjs';

import { MOCK_MODE } from '@/lib/config';
import { MockSignIn } from '@/components/auth/mock-sign-in';

export default function Page() {
  if (MOCK_MODE) {
    return <MockSignIn />;
  }

  return (
    <div className="w-full flex justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "w-full shadow-xl border border-slate-200/80 rounded-2xl",
            formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold",
          }
        }}
      />
    </div>
  );
}

