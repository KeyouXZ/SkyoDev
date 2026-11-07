import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ScanLine,
  TrendingUp,
  Bell,
  ArrowRight,
  Check,
} from "lucide-react";
import { getCurrentUser } from "@/auth/currentUser";
export const instant = false;

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    desc: "Key numbers at a glance — products, low stock, pending orders, and inventory value with a sales chart.",
  },
  {
    icon: Package,
    title: "Inventory",
    desc: "Add, edit, and delete products. Search by name or SKU, filter low stock, and export to CSV.",
  },
  {
    icon: ShoppingCart,
    title: "Purchase Orders",
    desc: "Create and track orders with line items through a draft → sent → received flow.",
  },
  {
    icon: ScanLine,
    title: "Barcode Scanner",
    desc: "Scan barcodes or QR codes to receive stock or record a sale in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Sales Forecast",
    desc: "30-day demand predictions with reorder recommendations so you never run out.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Low-stock and reorder alerts in the header, plus optional web push notifications.",
  },
];

const STEPS = [
  "Add your products and suppliers",
  "Record sales or scan barcodes to move stock",
  "Get reorder suggestions before you run out",
];

export default async function Home() {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  return (
    <div className="min-h-dvh bg-[#ddf1f7] font-sans text-gray-800 antialiased">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-2xl font-black tracking-widest text-[#00a2be]">
          NIRAGA
        </span>
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className="rounded-xl bg-[#00a2be] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
        >
          {isLoggedIn ? "Dashboard" : "Get started"}
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 text-center sm:pt-16">
        <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          Stock &amp; Inventory,{" "}
          <span className="text-[#00a2be]">without the guesswork</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Track products, record sales, scan barcodes, manage purchase orders,
          and get reorder suggestions before you run out — all from one clean
          dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="flex items-center gap-2 rounded-xl bg-[#00a2be] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
          >
            {isLoggedIn ? "Go to Dashboard" : "Start free"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          {STEPS.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a2be]/15 text-[#00a2be]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-white/60 py-6 text-center text-xs text-gray-500">
        © 2026 SkyoDev. All rights reserved.
      </footer>
    </div>
  );
}
