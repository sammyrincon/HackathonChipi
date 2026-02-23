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
