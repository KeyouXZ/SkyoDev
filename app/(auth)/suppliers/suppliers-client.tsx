"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Package,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { SupplierDialog } from "./supplier-dialog";
import type { Supplier } from "./types";

export default function SuppliersPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data: suppliers = [], mutate } = useSWR<Supplier[]>(
    "/api/suppliers",
    fetcher,
    swrOptions,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(`Delete supplier "${s.name}"?`)) return;
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/suppliers/${s.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete supplier");
      toast.success("Supplier deleted", {
        description: `${s.name} has been removed.`,
      });
      mutate();
    } catch (err) {
      toast.error("Could not delete supplier", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Header title="Suppliers" setSidebarOpen={setSidebarOpen} />

          {/* Toolbar */}
          <div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search suppliers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00a2be] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6]"
            >
              <Plus className="h-4 w-4" />
              New Supplier
            </button>
          </div>

          {/* Suppliers grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/60 px-4 py-16 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00a2be]/10 text-[#00a2be]">
                <Building2 className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-800">
                No suppliers found
              </p>
              <p className="mt-1 max-w-70 text-sm text-gray-500">
                {search
                  ? "No suppliers match your search."
                  : "Add your first supplier to start tracking contacts."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col rounded-2xl border border-white/60 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00a2be]/10 text-[#00a2be]">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900">
                          {s.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <Package className="h-3 w-3" />
                          {s._count?.products ?? 0}{" "}
                          {(s._count?.products ?? 0) === 1
                            ? "product"
                            : "products"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={busyId === s.id}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                    {s.email && (
                      <p className="flex items-center gap-2 truncate text-gray-600">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{s.email}</span>
                      </p>
                    )}
                    {s.phone && (
                      <p className="flex items-center gap-2 truncate text-gray-600">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{s.phone}</span>
                      </p>
                    )}
                    {s.address && (
                      <p className="flex items-start gap-2 text-gray-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>{s.address}</span>
                      </p>
                    )}
                    {!s.email && !s.phone && !s.address && (
                      <p className="text-xs text-gray-400">
                        No contact details added.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {dialogOpen && (
        <SupplierDialog
          supplier={editing}
          onCloseAction={() => setDialogOpen(false)}
          onSavedAction={() => {
            setDialogOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}
