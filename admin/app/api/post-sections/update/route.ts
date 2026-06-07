// app/api/post-sections/update/route.ts

import { PostSection } from "@/types/post-section";
import { getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const LOCAL_DEV_URL = "http://127.0.0.1:8000";
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

export async function PATCH(_req: NextRequest) {
  // read post_id and key from query params
  const section_id = _req.nextUrl.searchParams.get("id");

  if (!section_id) {
    return NextResponse.json(
      { error: "Missing section id query parameter" },
      { status: 400 },
    );
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: missing token" },
      { status: 401 },
    );
  }

  let body: Partial<PostSection>;

  try {
    body = (await _req.json()) as Partial<PostSection>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Build FastAPI endpoint
  const endpoint = `${FASTAPI_URL}/post-sections/${section_id}`;

  try {
    // 4. Forward PATCH to FastAPI
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    const updated = (await res.json()) as PostSection;
    return NextResponse.json<PostSection>(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach backend: ${err}` },
      { status: 502 },
    );
  }
}
