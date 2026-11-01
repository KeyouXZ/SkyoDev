import { Spinner } from '@/components/Spinner';

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-[#ddf1f7]">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" color="#00a2be" />
        <h2 className="text-xl text-gray-700 font-semibold">Loading...</h2>
      </div>
    </div>
  );
}
