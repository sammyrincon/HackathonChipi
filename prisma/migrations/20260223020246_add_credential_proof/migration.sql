/*
  Warnings:

  - You are about to drop the column `lastVerifiedAt` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `Credential` table. All the data in the column will be lost.
  - Made the column `issuedAt` on table `Credential` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiresAt` on table `Credential` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Credential_walletAddress_status_expiresAt_idx";

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "lastVerifiedAt",
DROP COLUMN "revokedAt",
ALTER COLUMN "issuedAt" SET NOT NULL,
ALTER COLUMN "issuedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialProof" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "scheme" TEXT NOT NULL,
    "proof" JSONB NOT NULL,
    "publicSignals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredentialProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_clerkUserId_idx" ON "ActivityLog"("clerkUserId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialProof_credentialId_key" ON "CredentialProof"("credentialId");

-- CreateIndex
CREATE INDEX "CredentialProof_walletAddress_idx" ON "CredentialProof"("walletAddress");

-- CreateIndex
CREATE INDEX "CredentialProof_credentialId_idx" ON "CredentialProof"("credentialId");
