"use client";

import { useState } from "react";
import { Navigation } from "./Navigation";
import { Header } from "./Header";
import type { CurrentUser } from "@/auth/currentUser";

interface PageShellProps {
  title: string;
  user?: CurrentUser;
  children: React.ReactNode;
}

/**
 * Shared layout for all (auth) pages: sidebar navigation, header,
 * and main content area. Manages sidebar open state internally.
 */
export function PageShell({ title, user, children }: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-3 sm:gap-4 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Header title={title} setSidebarOpen={setSidebarOpen} user={user} />
          {children}
        </main>
      </div>
    </div>
  );
}
