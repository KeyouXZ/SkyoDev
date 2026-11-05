"use client";

import { useEffect, useRef, useState } from "react";

interface RotatingIndicatorProps {
  items: React.ReactNode[];
  intervalMs?: number;
  className?: string;
}

export function RotatingIndicator({
  items,
  intervalMs = 5000,
  className,
}: RotatingIndicatorProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const count = items.length;
  const safeIndex = count === 0 ? 0 : index % count;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => {
      setVisible(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % count);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setVisible(true);
        });
      }, 300);
    }, intervalMs);
    return () => {
      clearInterval(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count, intervalMs, paused]);

  if (count === 0) return null;
  if (count === 1) {
    return <div className={`w-full ${className ?? ""}`}>{items[0]}</div>;
  }

  return (
    <div
      className={`relative min-h-4 w-full overflow-hidden ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`transition-all duration-300 ease-out ${
          visible ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}
      >
        {items[safeIndex]}
      </div>
    </div>
  );
}
