import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/currentUser";

export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
