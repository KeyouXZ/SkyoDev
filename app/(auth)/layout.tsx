import { getCurrentUser } from "@/auth/currentUser";
import { UserProvider } from "@/context/UserContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { Suspense } from "react";
import LoadingPage from "@/components/Suspense";
import { PushProvider } from "@/components/PushProvider";

export const instant = false;

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser({ redirectIfNotFound: true });

  return (
    <Suspense fallback={<LoadingPage />}>
      <UserProvider value={user}>
        <PreferencesProvider>
          <PushProvider>{children}</PushProvider>
        </PreferencesProvider>
      </UserProvider>
    </Suspense>
  );
}
