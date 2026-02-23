import { NextResponse } from "next/server";

/**
 * Health check for load balancers and orchestration (Vercel, k8s, etc.).
 * GET /api/healthz — no auth, returns 200 when the app is alive.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
