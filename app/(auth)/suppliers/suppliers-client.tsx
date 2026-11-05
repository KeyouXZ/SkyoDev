"use client";

import { Building2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SupplierDialog } from "./supplier-dialog";
import { SupplierToolbar } from "./supplier-toolbar";
import { SupplierCard } from "./supplier-card";
import { useSuppliers } from "./use-suppliers";
import { usePreferences } from "@/context/PreferencesContext";

export default function SuppliersPageClient() {
  const { t } = usePreferences();
  const {
    search,
    setSearch,
    dialogOpen,
    setDialogOpen,
    editing,
    busyId,
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
      {filtered.length === 0 ? (
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
              onDeleteAction={handleDelete}
            />
          ))}
        </div>
      )}

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
