import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default async function RootPage() {
  const token = await getAuthToken()
  if (!token) {
    redirect('/login');
  }
  redirect('/dashboard');
}