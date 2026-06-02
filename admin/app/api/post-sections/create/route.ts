// app/api/post-sections/create/route.ts

import { getAuthToken } from "@/lib/auth";
import { PostSection } from "@/types/post-section";
import { NextRequest, NextResponse } from "next/server";

const LOCAL_DEV_URL = "http://127.0.0.1:8000"
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

export async function POST(_req: NextRequest) {
    const { post_id, key, title, order_index, content_md } = await _req.json()

    // VALIDATION: SIMPLE VALIDATION
    if (!post_id) {
                return NextResponse.json(
        { error: "Post not found" },
        { status: 400 }
        );
    }

        if (!title || !key || !order_index || !content_md) {
        return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
        );
    }

    // AUTHORIZATION
        const token = await getAuthToken();
    if (!token) {
        return NextResponse.json(
        { error: "Unauthorized: missing token" },
        { status: 401 }
        );
    }

    // EMBED DATA INTO REQUEST BODY
       const body = new URLSearchParams()
    body.set("title", title)
    body.set("post_id", post_id)
    body.set("key", key)
    body.set("order_index", order_index)
    body.set("content_md", content_md)

    const ENDPOINT = `${FASTAPI_URL}/post-sections`

        try {
            const res = await fetch(ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // required by get_current_user
                },
                body: JSON.stringify({
                    title,
                    post_id,
                    key,
                    order_index,
                    content_md,
                }),
            });
    
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return NextResponse.json(
                    { error: (data as { detail?: string }).detail ?? "Invalid data" },
                    { status: res.status }
                );
            }
    
            const data = (await res.json()) as PostSection
            return NextResponse.json<PostSection>(data, { status: 201 });
    
        } catch (e) {
            return NextResponse.json(
                { error: `Failed to reach backend: ${e}` },
                { status: 502 }
            );
        }

}
