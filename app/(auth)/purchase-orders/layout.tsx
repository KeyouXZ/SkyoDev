import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Orders - NIRAGA",
  description:
    "NIRAGA Purchase Orders — create, send, and receive purchase orders from your suppliers.",
};

export default function PurchaseOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
