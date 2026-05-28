// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const LOCAL_DEV_URL = "http://127.0.0.1:8000"
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL 

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json(
            {error: "Missing credentials"},
            {status: 400}
        );
    }

    const body = new URLSearchParams();
    body.set("username", username);
    body.set("password", password);

    const res = await fetch(`${FASTAPI_URL}/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    if(!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(
            { error: data.detail ?? "Invalid credentials" },
            { status: res.status }
        );
    }

    const data = await res.json();

    const response = NextResponse.json({ success: true });

    response.cookies.set("access_token", data.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30*60,
    });

    return response;
}