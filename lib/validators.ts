import { z } from "zod";

const STARKNET_ADDRESS_REGEX = /^0x[0-9a-fA-F]{1,64}$/;
const TX_HASH_REGEX = /^0x[0-9a-fA-F]{1,128}$/;

export const walletAddressSchema = z
  .string()
  .trim()
  .min(1, "Wallet address required")
  .regex(STARKNET_ADDRESS_REGEX, "Invalid Starknet wallet address");

export const txHashSchema = z
  .string()
  .trim()
  .min(1, "Transaction hash required")
  .regex(TX_HASH_REGEX, "Invalid transaction hash");

export const kycSubmitSchema = z.object({
  walletAddress: z.string().trim().min(0).max(128).optional(),
  /** Real tx hash or "0xsim" for dev when ALLOW_FAKE_PAYMENTS=true */
  transactionHash: z.union([txHashSchema, z.literal("0xsim")]).optional(),
  /** Simulated KYC payload (demo only, not stored as real docs) */
  fullName: z.string().trim().min(1).max(200).optional(),
  country: z.string().trim().min(1).max(4).optional(),
});

export const verifySchema = z.object({
  walletAddress: walletAddressSchema,
});

export type KycSubmitInput = z.infer<typeof kycSubmitSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
