/**
 * Verifies that a payment (txHash) from walletAddress to the merchant was valid.
 * Stub: in production returns false unless real on-chain verification is implemented.
 * In development, set ALLOW_FAKE_PAYMENTS=true to accept any txHash for demo.
 */
export async function verifyPayment(
  _txHash: string,
  _walletAddress: string
): Promise<boolean> {
  if (process.env.ALLOW_FAKE_PAYMENTS === "true") {
    return true;
  }
  return false;
}
