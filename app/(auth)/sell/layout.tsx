import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Products - NIRAGA",
  description:
    "NIRAGA Sell — record sales by SKU, deduct stock, and review recent transactions.",
};

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
