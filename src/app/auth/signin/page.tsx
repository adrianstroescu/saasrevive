import { Suspense } from "react";
import SignInClient from "./signInClient";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-6 py-16">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-6 text-sm text-neutral-700">Loading…</p>
        </main>
      }
    >
      <SignInClient />
    </Suspense>
  );
}
