import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - NIRAGA',
  description: 'Login to NIRAGA',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
