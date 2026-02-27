/**
 * Single source of truth for demo mode across the entire app.
 *
 * Frontend: NEXT_PUBLIC_DEMO=true   → exposed to the browser
 * Backend:  DEMO=true               → server-only, never sent to the client
 *
 * Production safety: importing this module on the server while DEMO=true
 * will throw immediately so the server never boots in demo mode.
 */

if (process.env.NODE_ENV === "production" && process.env.DEMO === "true") {
  throw new Error(
    "Demo mode cannot be enabled in production. Unset DEMO=true before deploying."
  );
}

/** True when NEXT_PUBLIC_DEMO=true. Safe to use in both server and client code. */
export const isFrontendDemo = process.env.NEXT_PUBLIC_DEMO === "true";

/**
 * True when DEMO=true. Server-only — `process.env.DEMO` is never bundled
 * into the client because it lacks the NEXT_PUBLIC_ prefix.
 */
export const isBackendDemo = process.env.DEMO === "true";
