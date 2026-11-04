"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App-wide Sonner toaster, styled to match the NIRAGA theme
 * (teal accent, soft rounded cards, subtle borders).
 *
 * Position is responsive: bottom-right on desktop, top-right on mobile
 * (so toasts don't cover the header on small screens).
 */
export function Toaster({ ...props }: ToasterProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Sonner
      position={isMobile ? "top-right" : "bottom-right"}
      richColors={false}
      closeButton={false}
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#111827",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
          fontSize: "12.5px",
          padding: "8px 12px",
          minHeight: "40px",
          gap: "8px",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#111827",
          "--normal-border": "#e5e7eb",
          "--success-bg": "#ecfdf5",
          "--success-text": "#065f46",
          "--success-border": "#a7f3d0",
          "--error-bg": "#fef2f2",
          "--error-text": "#991b1b",
          "--error-border": "#fecaca",
          "--warning-bg": "#fffbeb",
          "--warning-text": "#92400e",
          "--warning-border": "#fde68a",
          "--info-bg": "#f0f9ff",
          "--info-text": "#075985",
          "--info-border": "#bae6fd",
          "--border-radius": "14px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
