import { getCurrentUser } from "@/auth/currentUser";
import { redirect } from "next/navigation";
import LoginForm from "./Form";

export const instant = false;

export default async function LoginPage() {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: false,
  });
  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
