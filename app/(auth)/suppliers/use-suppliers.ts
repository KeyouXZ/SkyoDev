"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, swrOptions } from "@/lib/fetcher";
import { usePreferences } from "@/context/PreferencesContext";
import type { Supplier } from "./types";

export function useSuppliers() {
  const { t } = usePreferences();
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
    if (!window.confirm(t("suppliers.confirmDelete", { name: s.name }))) return;
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/suppliers/${s.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.error ?? t("suppliers.failedToDelete"));
      toast.success(t("suppliers.supplierDeleted"), {
        description: `${s.name} has been removed.`,
      });
      mutate();
    } catch (err) {
      toast.error(t("suppliers.couldNotDelete"), {
        description:
          err instanceof Error
            ? err.message
            : t("inventory.somethingWentWrong"),
      });
    } finally {
      setBusyId(null);
    }
  };

  return {
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
  };
}
