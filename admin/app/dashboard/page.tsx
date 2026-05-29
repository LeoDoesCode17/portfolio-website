// app/dashbaord/page.tsx

import { getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import PostListSection from "./components/PostListSection";

export default async function DashboardPage() {
    const token = await getAuthToken();
    if(!token) {
        redirect('/login');
    }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <PostListSection/>
      </div>
    </main>
  );    
}