import { isBackendDemo } from "@/lib/demo";

/**
 * Verifies that a payment (txHash) from walletAddress to the merchant was valid.
 * - DEMO=true: accept 0xDEMO_* hashes (no RPC, no funds).
 * - ALLOW_FAKE_PAYMENTS=true: accept any txHash (dev only, not part of demo flag).
 * - Production: returns false unless real on-chain verification is implemented.
 */
export async function verifyPayment(
  txHash: string,
  _walletAddress: string
): Promise<boolean> {
  if (isBackendDemo && /^0xDEMO_\d+$/.test(txHash)) {
    return true;
  }
  if (process.env.ALLOW_FAKE_PAYMENTS === "true") {
    return true;
  }
  return false;
}
