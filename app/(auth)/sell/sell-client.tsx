"use client";

import { PageShell } from "@/components/PageShell";
import { RecordSale } from "./record-sale";
import { RecentSales } from "./recent-sales";
import { SellTabs } from "./sell-tabs";
import { useSell } from "./use-sell";
import { usePreferences } from "@/context/PreferencesContext";

export default function SellPageClient() {
  const { t } = usePreferences();
  const {
    tab,
    setTab,
    query,
    setQuery,
    selected,
    setSelectedId,
    quantity,
    setQuantity,
    submitting,
    productsLoading,
    sales,
    results,
    total,
    insufficient,
    handleSelect,
    handleRecordSale,
  } = useSell();

  return (
    <PageShell title={t("sell.title")}>
      <SellTabs
        tab={tab}
        salesCount={sales.length}
        onTabChangeAction={setTab}
      />

      <div className="mx-auto mt-5 w-full max-w-2xl flex-1">
        {tab === "record" ? (
          <RecordSale
            productsLoading={productsLoading}
            query={query}
            onQueryChangeAction={setQuery}
            results={results}
            selected={selected}
            onSelectAction={handleSelect}
            onClearSelectionAction={() => setSelectedId(null)}
            quantity={quantity}
            onQuantityChangeAction={setQuantity}
            total={total}
            insufficient={insufficient}
            submitting={submitting}
            onRecordAction={handleRecordSale}
          />
        ) : (
          <RecentSales sales={sales} />
        )}
      </div>
    </PageShell>
  );
}
