// app/api/posts/get-all/route.ts

import { Post } from "@/types/post";
import { NextRequest, NextResponse } from "next/server";

const LOCAL_DEV_URL = "http://127.0.0.1:8000"
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL 
const ENDPOINT = `${FASTAPI_URL}/posts/`

export async function GET(req: NextRequest) {
    try {
        const res = await fetch(ENDPOINT, {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })

        if (!res.ok) {
            const data = await res.json().catch(() => {});
            const error = (data as { detail?: string }).detail ?? "Failed to fetch posts"
            return NextResponse.json({ error }, {status: res.status });
        }

        const data = (await res.json()) as Post[];
        return NextResponse.json<Post[]>(data, { status: 200 });
    } catch(e) {
        return NextResponse.json(
            { error: `Failed to reach backend: ${e}` },
            { status: 502 }
        );        
    }
}