import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "API is working" });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        return NextResponse.json({ received: body, message: "POST working" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to parse body" }, { status: 400 });
    }
}