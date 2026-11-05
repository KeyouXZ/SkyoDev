"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { emptySupplierForm, type Supplier, type SupplierForm } from "./types";
import { usePreferences } from "@/context/PreferencesContext";

export function SupplierDialog({
  supplier,
  onCloseAction,
  onSavedAction,
}: {
  supplier: Supplier | null;
  onCloseAction: () => void;
  onSavedAction: () => void;
}) {
  const { t } = usePreferences();
  const isEdit = !!supplier;
  const [form, setForm] = useState<SupplierForm>(() =>
    supplier
      ? {
          name: supplier.name,
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          address: supplier.address ?? "",
          notes: supplier.notes ?? "",
        }
      : emptySupplierForm,
  );
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof SupplierForm>(
    key: K,
    value: SupplierForm[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error(t("suppliers.nameRequired"));
      return;
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      toast.error(t("suppliers.invalidEmail"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/suppliers/${supplier!.id}` : "/api/suppliers",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            address: form.address.trim() || null,
            notes: form.notes.trim() || null,
          }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? t("suppliers.failedToSave"));

      toast.success(
        isEdit
          ? t("suppliers.supplierUpdated")
          : t("suppliers.supplierCreated"),
        {
          description: `${form.name.trim()} has been saved.`,
        },
      );
      onSavedAction();
    } catch (err) {
      toast.error(t("suppliers.couldNotSave"), {
        description:
          err instanceof Error
            ? err.message
            : t("inventory.somethingWentWrong"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !submitting && onCloseAction()}
      />
      <div className="relative m-4 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl sm:max-w-md">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {isEdit ? t("suppliers.editSupplier") : t("suppliers.newSupplier")}
          </h2>
          <button
            onClick={onCloseAction}
            disabled={submitting}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label className={labelCls}>{t("suppliers.name")}</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Supplier name"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t("suppliers.email")}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="contact@supplier.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t("suppliers.phone")}</label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+1 555 000 1234"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t("suppliers.address")}</label>
            <input
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Street, city, country"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              {t("suppliers.notes")}{" "}
              <span className="text-gray-400">{t("suppliers.optional")}</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Lead times, payment terms…"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onCloseAction}
            disabled={submitting}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? t("suppliers.saving")
              : isEdit
                ? t("suppliers.saveChanges")
                : t("suppliers.createSupplier")}
          </button>
        </div>
      </div>
    </div>
  );
}
