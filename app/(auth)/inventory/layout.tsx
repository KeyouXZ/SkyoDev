import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory - NIRAGA",
  description:
    "NIRAGA Inventory — browse products, SKUs, stock levels, reorder points, and cost/price data.",
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
