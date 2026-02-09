import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-black/5 bg-white/70 p-10 text-center backdrop-blur">
        <div className="mx-auto inline-flex rounded-full bg-rose-600/10 px-3 py-1 text-xs font-medium text-rose-700">
          404
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The page you’re looking for doesn’t exist (or it moved).
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="rounded-md bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 px-4 py-2 text-sm font-medium text-white"
          >
            Go home
          </Link>
          <Link
            href="/listings"
            className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-black/5"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </main>
  );
}
