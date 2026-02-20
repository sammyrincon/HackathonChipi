import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.deleted" && "id" in evt.data) {
      // Optional: delete Credential for this user
      // const { prisma } = await import("@/lib/db");
      // await prisma.credential.deleteMany({ where: { clerkUserId: evt.data.id } });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
