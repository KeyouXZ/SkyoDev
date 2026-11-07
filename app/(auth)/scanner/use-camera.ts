"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { usePreferences } from "@/context/PreferencesContext";

export function useCamera(
  onScan: (code: string) => void,
  onError: (title: string, message: string) => void,
) {
  const { t } = usePreferences();
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({
    value: "",
    at: 0,
  });

  const stopCamera = useCallback(async () => {
    const scanner = qrCodeRef.current;
    qrCodeRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // Already stopped.
      }
      scanner.clear();
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    const el = scannerRef.current;
    if (!el) return;
    try {
      const scanner = new Html5Qrcode("niraga-scanner");
      qrCodeRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 160 } },
        (decodedText) => {
          const value = decodedText.trim();
          if (!value) return;
          const now = Date.now();
          // Debounce repeat scans of the same code.
          if (
            value !== lastScanRef.current.value ||
            now - lastScanRef.current.at > 2500
          ) {
            lastScanRef.current = { value, at: now };
            onScan(value);
          }
        },
        () => {
          // Per-frame decode errors are expected; ignore.
        },
      );
      setScanning(true);
    } catch (err) {
      onError(
        t("scanner.cameraUnavailable"),
        err instanceof Error ? err.message : t("scanner.cameraHint"),
      );
      stopCamera();
    }
  }, [onScan, onError, stopCamera, t]);

  return { scanning, scannerRef, startCamera, stopCamera };
}
