// app/api/post-sections/get-by-post/route.ts

import { NextRequest, NextResponse } from "next/server";
import type { PostSection } from "@/types/post-section";

const LOCAL_DEV_URL = "http://127.0.0.1:8000";
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("post_id");
  if (!postId) {
    return NextResponse.json(
      { error: "Missing post id query parameter" },
      { status: 400 },
    );
  }

  const ENDPOINT = `${FASTAPI_URL}/post-sections/by-post/${encodeURIComponent(postId)}`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => {});
      const error =
        (data as { detail?: string }).detail ??
        `Failed to fetch post sections of post ${postId}`;
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = (await res.json()) as PostSection[];
    return NextResponse.json<PostSection[]>(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach backend: ${err}` },
      { status: 502 },
    );
  }
}
