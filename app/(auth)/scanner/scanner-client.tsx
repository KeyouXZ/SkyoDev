"use client";

import { ScanLine } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ProductResult } from "./product-result";
import { CameraViewfinder } from "./camera-viewfinder";
import { ManualSkuEntry } from "./manual-sku-entry";
import { useScanner } from "./use-scanner";
import { usePreferences } from "@/context/PreferencesContext";
import { AlertDialog } from "@/components/AlertDialog";

export default function ScannerPageClient() {
  const { t } = usePreferences();
  const {
    sku,
    setSku,
    result,
    looking,
    scanning,
    receiveQty,
    setReceiveQty,
    busyAction,
    alert,
    setAlert,
    scannerRef,
    stopCamera,
    startCamera,
    lookup,
    handleReceive,
    handleSell,
  } = useScanner();

  return (
    <PageShell title={t("scanner.title")}>
      <div className="mx-auto mt-5 w-full max-w-2xl">
        <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900">
                {t("scanner.scanProduct")}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {t("scanner.scanSubtitle")}
              </p>
            </div>
          </div>

          <CameraViewfinder
            scanning={scanning}
            scannerRef={scannerRef}
            onStartAction={startCamera}
            onStopAction={stopCamera}
          />

          <ManualSkuEntry
            sku={sku}
            looking={looking}
            onSkuChangeAction={setSku}
            onLookupAction={lookup}
          />

          {/* Result */}
          {result && (
            <ProductResult
              result={result}
              receiveQty={receiveQty}
              onReceiveQtyChangeAction={setReceiveQty}
              busyAction={busyAction}
              onReceiveAction={handleReceive}
              onSellAction={handleSell}
            />
          )}
        </div>
      </div>

      <AlertDialog
        open={alert !== null}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        onCloseAction={() => setAlert(null)}
      />
    </PageShell>
  );
}
