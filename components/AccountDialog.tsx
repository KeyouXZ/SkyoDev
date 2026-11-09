"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";

interface AccountDialogProps {
  open: boolean;
  onCloseAction: () => void;
}

interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  profileImageUrl: string | null;
  phoneNumber: string | null;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

export function AccountDialog({ open, onCloseAction }: AccountDialogProps) {
  const { t } = usePreferences();
  const user = useUser();
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Profile | null) => {
        if (!data) return;
        setName(data.name ?? "");
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhoneNumber(data.phoneNumber ?? "");
      })
      .catch(() => {
        toast.error(t("inventory.somethingWentWrong"));
      });
  }, [open, t]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t("inventory.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? t("inventory.failedToSave"));
      }
      toast.success(t("header.accountUpdated"));
      onCloseAction();
    } catch (err) {
      toast.error(t("header.couldNotSaveAccount"), {
        description:
          err instanceof Error
            ? err.message
            : t("inventory.somethingWentWrong"),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !saving && onCloseAction()}
      />
      <div className="relative m-4 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {t("header.accountSettings")}
          </h2>
          <button
            onClick={onCloseAction}
            disabled={saving}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-gray-600">
            {user.email}
          </div>
          <div>
            <label className={labelCls}>{t("suppliers.name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Demo User"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("header.firstName")}</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Demo"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("header.lastName")}</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="User"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("suppliers.phone")}</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+62 812 3456 7890"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onCloseAction}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a2be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008ea6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? t("inventory.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
