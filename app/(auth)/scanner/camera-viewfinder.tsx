"use client";

import { Camera, CameraOff } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface CameraViewfinderProps {
  scanning: boolean;
  scannerRef: React.RefObject<HTMLDivElement | null>;
  onStartAction: () => void;
  onStopAction: () => void;
}

export function CameraViewfinder({
  scanning,
  scannerRef,
  onStartAction,
  onStopAction,
}: CameraViewfinderProps) {
  const { t } = usePreferences();
  return (
    <>
      {/* Camera viewfinder */}
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gray-900 shadow-sm">
        <div
          id="niraga-scanner"
          ref={scannerRef}
          className="aspect-4/3 w-full sm:aspect-video [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/85 text-center">
            <Camera className="h-8 w-8 text-white/60" />
            <p className="px-6 text-sm font-medium text-white/80">
              {t("scanner.cameraOff")}
            </p>
            <p className="px-6 text-xs text-white/50">
              {t("scanner.cameraOffHint")}
            </p>
          </div>
        )}
        {scanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-56 rounded-2xl border-2 border-dashed border-white/70" />
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {scanning ? (
          <button
            onClick={onStopAction}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
          >
            <CameraOff className="h-4 w-4" />
            {t("scanner.stopCamera")}
          </button>
        ) : (
          <button
            onClick={onStartAction}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
          >
            <Camera className="h-4 w-4" />
            {t("scanner.startCamera")}
          </button>
        )}
      </div>
    </>
  );
}
