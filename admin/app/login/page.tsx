// app/login/page.tsx
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const token = await getAuthToken();

  // Already logged in → go to dashboard
  if (token) {
    redirect("/dashboard");
  }

  // Not logged in → show form
  return <LoginForm />;
}