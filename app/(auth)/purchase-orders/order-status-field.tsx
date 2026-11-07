"use client";

import { usePreferences } from "@/context/PreferencesContext";

export function OrderStatusField({
  status,
  onStatusChangeAction,
}: {
  status: "draft" | "sent";
  onStatusChangeAction: (status: "draft" | "sent") => void;
}) {
  const { t } = usePreferences();
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {t("purchaseOrders.status")}
      </label>
      <div className="flex gap-2">
        {(["draft", "sent"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChangeAction(s)}
            className={`flex-1 cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all ${
              status === s
                ? "bg-[#00a2be] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t(`purchaseOrders.${s}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
