import SellForm from "./sellForm";

export default async function NewListingPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-white">Create listing</h1>
      <p className="mt-2 text-sm text-zinc-300">
        Add details about your SaaS so buyers can evaluate it. You can post as a
        guest without creating an account.
      </p>
      <SellForm />
    </main>
  );
}
