"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { ScanLine, Search, Camera, CameraOff } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { ProductResult, type ScanResult } from "./product-result";

export default function ScannerPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [looking, setLooking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiveQty, setReceiveQty] = useState(1);
  const [busy, setBusy] = useState(false);

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

  const lookup = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLooking(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/scanner?sku=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Product not found");
      }
      setResult(data as ScanResult);
      setReceiveQty(1);
    } catch (err) {
      toast.error("Product not found", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLooking(false);
    }
  }, []);

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
            setSku(value);
            lookup(value);
          }
        },
        () => {
          // Per-frame decode errors are expected; ignore.
        },
      );
      setScanning(true);
    } catch (err) {
      toast.error("Camera unavailable", {
        description:
          err instanceof Error
            ? err.message
            : "Could not access the camera. Enter the SKU manually.",
      });
      stopCamera();
    }
  }, [lookup, stopCamera]);

  const handleReceive = async () => {
    if (!result || receiveQty < 1) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${result.product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockLevel: result.product.stockLevel + receiveQty,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to receive stock");
      }
      toast.success("Stock received", {
        description: `Added ${receiveQty} × ${result.product.name}. New stock: ${data.stockLevel}.`,
      });
      setResult((r) =>
        r
          ? { ...r, product: { ...r.product, stockLevel: data.stockLevel } }
          : r,
      );
      setReceiveQty(1);
    } catch (err) {
      toast.error("Could not receive stock", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSell = async () => {
    if (!result) return;
    if (result.product.stockLevel < 1) {
      toast.error("Out of stock", {
        description: `${result.product.name} has no stock to sell.`,
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: result.product.id, quantity: 1 }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to record sale");
      }
      toast.success("Sale recorded", {
        description: `1 × ${result.product.name} — $${(result.product.price / 100).toFixed(2)}`,
      });
      setResult((r) =>
        r
          ? {
              ...r,
              product: {
                ...r.product,
                stockLevel: data.currentStock ?? r.product.stockLevel - 1,
              },
            }
          : r,
      );
    } catch (err) {
      toast.error("Could not record sale", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Header title="Barcode Scanner" setSidebarOpen={setSidebarOpen} />

          <div className="mx-auto mt-5 w-full max-w-2xl flex-1">
            <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
                  <ScanLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900">
                    Scan Product
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Scan a barcode or QR code to receive and sell in seconds
                  </p>
                </div>
              </div>

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
                      Camera is off
                    </p>
                    <p className="px-6 text-xs text-white/50">
                      Start the camera to scan, or enter a SKU below.
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
                    onClick={stopCamera}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
                  >
                    <CameraOff className="h-4 w-4" />
                    Stop Camera
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
                  >
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </button>
                )}
              </div>

              {/* Manual SKU entry */}
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  lookup(sku);
                }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Enter SKU manually…"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 font-mono text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:font-sans placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={looking || !sku.trim()}
                  className="cursor-pointer rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {looking ? "Looking…" : "Lookup"}
                </button>
              </form>

              {/* Result */}
              {result && (
                <ProductResult
                  result={result}
                  receiveQty={receiveQty}
                  onReceiveQtyChangeAction={setReceiveQty}
                  busy={busy}
                  onReceiveAction={handleReceive}
                  onSellAction={handleSell}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
