"use client";

import { usePreferences } from "@/context/PreferencesContext";

export function OrderNotesField({
  notes,
  onNotesChangeAction,
}: {
  notes: string;
  onNotesChangeAction: (value: string) => void;
}) {
  const { t } = usePreferences();
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {t("purchaseOrders.notes")}{" "}
        <span className="text-gray-400">{t("purchaseOrders.optional")}</span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => onNotesChangeAction(e.target.value)}
        rows={2}
        placeholder={t("purchaseOrders.notesPlaceholder")}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs outline-none placeholder:text-gray-400 focus:border-[#00a2be] focus:ring-2 focus:ring-[#00a2be]/20"
      />
    </div>
  );
}
