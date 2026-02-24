/**
 * Validates that the string is a canonical StarkNet contract address:
 * 0x followed by exactly 64 hexadecimal characters (case-insensitive).
 * Raw public keys and other formats are not valid for explorer links or QR.
 */
export function isValidStarknetAddress(address: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  return /^0x[0-9a-fA-F]{64}$/.test(trimmed);
}
