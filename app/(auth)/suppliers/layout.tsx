import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers - NIRAGA",
  description:
    "NIRAGA Suppliers — track supplier contacts and link them to your products.",
};

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
