import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWalletAddress(address: string, prefix = 10, suffix = 8): string {
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
}

export function normalizeWallet(wallet: string): string {
  return wallet.trim().toLowerCase();
}

export { isValidStarknetAddress } from "./isValidStarknetAddress";

const VOYAGER_MAINNET_URL = "https://voyager.online";
const STARKSCAN_MAINNET_URL = "https://starkscan.co";

/**
 * Normalizes a StarkNet address to the canonical form Voyager/Starkscan accept:
 * exactly 0x + 64 hexadecimal characters (lowercase, zero-padded).
 * Strips non-hex chars; if >64 hex digits, uses the last 64.
 */
export function padStarknetAddress(address: string): string {
  const raw = address.trim().toLowerCase().replace(/^0x/, "");
  const hex = raw.replace(/[^0-9a-f]/g, "");
  if (hex.length === 0) return "0x" + "0".repeat(64);
  const exactly64 = hex.length > 64 ? hex.slice(-64) : hex.padStart(64, "0");
  return "0x" + exactly64;
}

/**
 * Returns the Voyager block explorer URL for a StarkNet contract address (mainnet).
 * Address is zero-padded to 64 hex chars so Voyager can always resolve it.
 */
export function getVoyagerContractUrl(address: string): string {
  return `${VOYAGER_MAINNET_URL}/contract/${padStarknetAddress(address)}`;
}

/**
 * Returns the Starkscan block explorer URL (mainnet).
 * Address is zero-padded to 64 hex chars so Starkscan can always resolve it.
 */
export function getStarkscanContractUrl(address: string): string {
  return `${STARKSCAN_MAINNET_URL}/contract/${padStarknetAddress(address)}`;
}
