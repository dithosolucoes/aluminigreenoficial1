import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="w-full flex justify-center">
      <SignUp 
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

