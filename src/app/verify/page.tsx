import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import VerifyForm from "./verifyForm";

export default async function VerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/verify");
  }

  return (
      <main className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-black/5 bg-white/70 p-8 backdrop-blur">
          <div className="inline-flex rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700">
            Verification
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Build buyer trust</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Request verification to help buyers trust your listing.
          </p>

          <div className="mt-8">
            <VerifyForm />
          </div>
        </div>
      </main>
  );
}
