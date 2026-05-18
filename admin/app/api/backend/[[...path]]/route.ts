import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.API_URL ?? "http://fastapi:8000"

// API ROUTE REVERSE PROXY HANDLER

async function handler (
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> }
) {
    const { path } = await params
    const pathname = path ? `/${path.join("/")}` : "/"
    const target = `${FASTAPI_URL}${pathname}${req.nextUrl.search ?? ""}`

    const headers = new Headers()
    req.headers.forEach((value, key) => {
        if (!["host", "connection"].includes(key.toLowerCase())) {
            headers.set(key, value)
        }
    })

    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer()

    try {
        const res = await fetch(target, { method: req.method, headers, body })

        const resHeaders = new Headers()
        res.headers.forEach((value, key) => {
            if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
                resHeaders.set(key, value);
            }
        })

        return new NextResponse(res.body, { status: res.status, headers: resHeaders })
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to reach FastAPI backend", detail: String(err) },
            { status: 502 }
        )
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;