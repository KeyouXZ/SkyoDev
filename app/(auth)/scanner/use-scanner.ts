"use client";

import { useCallback, useState } from "react";
import { useCamera } from "./use-camera";
import { useLookup } from "./use-lookup";
import { useStockActions } from "./use-stock-actions";

export function useScanner() {
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(
    null,
  );

  const showAlert = useCallback((title: string, message: string) => {
    setAlert({ title, message });
  }, []);

  const {
    sku,
    setSku,
    result,
    setResult,
    looking,
    receiveQty,
    setReceiveQty,
    lookup,
  } = useLookup(showAlert);

  const { scanning, scannerRef, startCamera, stopCamera } = useCamera(
    (code) => {
      setSku(code);
      lookup(code);
    },
    showAlert,
  );

  const { busyAction, handleReceive, handleSell } = useStockActions(
    result,
    setResult,
    receiveQty,
    setReceiveQty,
    showAlert,
  );

  return {
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
  };
}
