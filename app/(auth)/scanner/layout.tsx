import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcode Scanner - NIRAGA",
  description:
    "NIRAGA Barcode Scanner — scan barcodes or QR codes to receive and sell inventory in seconds.",
};

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
