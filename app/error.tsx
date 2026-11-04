"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ddf1f7] p-4 font-sans antialiased">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-10">
        <p className="text-7xl font-black tracking-tight text-[#00a2be]">500</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
