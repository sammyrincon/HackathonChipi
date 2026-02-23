import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_TYPES = ["login", "wallet_created"] as const;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { type } = body as { type?: string };
    if (!type || !ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Invalid type. Use 'login' or 'wallet_created'" },
        { status: 400 }
      );
    }

    console.log("[activity/log]", { clerkUserId: userId, type });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/activity/log]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
