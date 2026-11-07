"use client";

import { Building2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SupplierDialog } from "./supplier-dialog";
import { SupplierToolbar } from "./supplier-toolbar";
import { SupplierCard } from "./supplier-card";
import { useSuppliers } from "./use-suppliers";
import { usePreferences } from "@/context/PreferencesContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SuppliersPageClient() {
  const { t } = usePreferences();
  const {
    search,
    setSearch,
    dialogOpen,
    setDialogOpen,
    editing,
    busyId,
    pendingDelete,
    setPendingDelete,
    isLoading,
    filtered,
    openCreate,
    openEdit,
    handleDelete,
    mutate,
  } = useSuppliers();

  return (
    <PageShell title={t("suppliers.title")}>
      <SupplierToolbar
        search={search}
        onSearchChangeAction={setSearch}
        onNewSupplierAction={openCreate}
      />

      {/* Suppliers grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/60 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />
                    <div>
                      <div className="h-4 w-28 rounded-full bg-slate-200" />
                      <div className="mt-2 h-3 w-20 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                  </div>
                </div>
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                  <div className="h-3.5 w-full rounded-full bg-slate-200" />
                  <div className="h-3.5 w-2/3 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/60 px-4 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00a2be]/10 text-[#00a2be]">
            <Building2 className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-gray-800">
            {t("suppliers.noSuppliers")}
          </p>
          <p className="mt-1 max-w-70 text-sm text-gray-500">
            {search ? t("suppliers.noMatch") : t("suppliers.addFirst")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {filtered.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              busy={busyId === s.id}
              onEditAction={openEdit}
              onDeleteAction={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("common.delete")}
        message={t("suppliers.confirmDelete", {
          name: pendingDelete?.name ?? "",
        })}
        busy={busyId !== null}
        onConfirmAction={() => pendingDelete && handleDelete(pendingDelete)}
        onCancelAction={() => setPendingDelete(null)}
      />

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
    </PageShell>
  );
}
