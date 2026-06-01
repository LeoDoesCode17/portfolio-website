// app/api/posts/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Post } from "@/types/post";
import { getAuthToken } from "@/lib/auth";

const LOCAL_DEV_URL = "http://127.0.0.1:8000";
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

export async function PATCH(req: NextRequest) {
  // 1. Read id from query params
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing id query parameter" },
      { status: 400 }
    );
  }

    const token = await getAuthToken();
    if (!token) {
        return NextResponse.json(
        { error: "Unauthorized: missing token" },
        { status: 401 }
        );
    }

  // 2. Read JSON body from client
  let body: Partial<Post>;
  try {
    body = (await req.json()) as Partial<Post>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 3. Build FastAPI endpoint
  const endpoint = `${FASTAPI_URL}/posts/${encodeURIComponent(id)}`;

  try {
    // 4. Forward PATCH to FastAPI
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error =
        (data as { detail?: string; error?: string }).detail ??
        (data as { error?: string }).error ??
        "Failed to update post";

      return NextResponse.json({ error }, { status: res.status });
    }

    // 5. Return updated post back to client
    const updated = (await res.json()) as Post;
    return NextResponse.json<Post>(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach backend: ${err}` },
      { status: 502 }
    );
  }
}