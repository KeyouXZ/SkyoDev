import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - NIRAGA',
  description: 'NIRAGA Inventory & Stock Management Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
