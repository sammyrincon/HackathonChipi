/**
 * Didit KYC integration (stub).
 * To be connected later: start verification session and poll for result.
 */

/** Start a Didit verification session; returns session ID for redirect or polling. */
export function startDiditSession(): Promise<{
  sessionId: string;
  redirectUrl?: string;
}> {
  return Promise.resolve({ sessionId: "" });
}

/** Fetch Didit verification result by session ID. */
export function fetchDiditResult(
  _sessionId: string
): Promise<{ status: string; verified?: boolean }> {
  return Promise.resolve({ status: "pending" });
}
