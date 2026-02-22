-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('PENDING', 'VERIFIED', 'REVOKED', 'EXPIRED');

-- AlterTable: add new columns
ALTER TABLE "Credential" ADD COLUMN "revokedAt" TIMESTAMP(3);
ALTER TABLE "Credential" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);

-- Make issuedAt and expiresAt nullable for PENDING credentials
ALTER TABLE "Credential" ALTER COLUMN "issuedAt" DROP NOT NULL;
ALTER TABLE "Credential" ALTER COLUMN "issuedAt" DROP DEFAULT;
ALTER TABLE "Credential" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- Change status from TEXT to enum (map existing 'verified' to VERIFIED)
ALTER TABLE "Credential" ALTER COLUMN "status" TYPE "CredentialStatus" USING (
  CASE
    WHEN "status" = 'verified' THEN 'VERIFIED'::"CredentialStatus"
    WHEN "status" = 'PENDING' THEN 'PENDING'::"CredentialStatus"
    WHEN "status" = 'REVOKED' THEN 'REVOKED'::"CredentialStatus"
    WHEN "status" = 'EXPIRED' THEN 'EXPIRED'::"CredentialStatus"
    ELSE 'PENDING'::"CredentialStatus"
  END
);

-- CreateIndex
CREATE INDEX "Credential_walletAddress_status_expiresAt_idx" ON "Credential"("walletAddress", "status", "expiresAt");
