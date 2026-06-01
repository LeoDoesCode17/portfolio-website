// app/api/posts/create/route.ts

import { getAuthToken } from "@/lib/auth";
import { Post } from "@/types/post";
import { NextRequest, NextResponse } from "next/server";

const LOCAL_DEV_URL = "http://127.0.0.1:8000"
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;
const ENDPOINT = `${FASTAPI_URL}/posts/`

export async function POST(_req: NextRequest) {
    const { title, slug, summary, repo_url, demo_url, is_published } = await _req.json()

    if (!title || !slug || !summary || !repo_url) {
        return NextResponse.json(
        { error: "title, slug, summary, and repo_url are required" },
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

    const body = new URLSearchParams()
    body.set("title", title)
    body.set("slug", slug)
    body.set("summary", summary)
    body.set("repo_url", repo_url)
    body.set("demo_url", demo_url)
    body.set("is_published", is_published)

    try {
        const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // required by get_current_user
            },
            body: JSON.stringify({
                title,
                slug,
                summary,
                repo_url,
                demo_url: demo_url ?? null,
                is_published: Boolean(is_published) ? false : Boolean(is_published),
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: (data as { detail?: string }).detail ?? "Invalid data" },
                { status: res.status }
            );
        }

        const data = (await res.json()) as Post
        return NextResponse.json<Post>(data, { status: 201 });

    } catch (e) {
        return NextResponse.json(
            { error: `Failed to reach backend: ${e}` },
            { status: 502 }
        );
    }
}