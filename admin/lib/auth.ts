// lib/auth.ts
import { cookies } from "next/headers";

export async function getAuthToken() {
  const store = await cookies();
  const token = store.get("access_token")?.value;
  return token ?? null;
}