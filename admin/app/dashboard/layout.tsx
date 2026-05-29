// app/dashboard/layout.tsx

import type { ReactNode } from "react";
import { getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

        <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:flex-row">
          <Sidebar />
          <section className="flex-1">{children}</section>
        </div>
      </div>
    </main>
  );
}