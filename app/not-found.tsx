import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ddf1f7] p-4 font-sans antialiased">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-10">
        <p className="text-7xl font-black tracking-tight text-[#00a2be]">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
