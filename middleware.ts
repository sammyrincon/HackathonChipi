import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/verify",
  "/business",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/healthz",
  "/api/kyc/verify",
  "/api/credential/status",
  "/api/proof/verify",
  "/api/proof/status",
]);

/**
 * Auth only. We NEVER create or regenerate wallet in middleware.
 * Onboarding redirect (UserWalletSecret exists → dashboard, else → /onboarding) is handled by OnboardingGuard in layout.
 */
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
