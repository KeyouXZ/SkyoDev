import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Forecast - NIRAGA",
  description:
    "NIRAGA Sales Forecast — demand predictions to plan reorders with confidence.",
};

export default function ForecastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
