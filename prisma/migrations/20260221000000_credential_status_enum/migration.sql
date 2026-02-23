-- 1) Create enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "CredentialStatus" AS ENUM ('PENDING', 'VERIFIED', 'REVOKED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Add new columns (idempotent)
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3);

-- 3) Make issuedAt/expiresAt nullable (as your comment says)
ALTER TABLE "Credential" ALTER COLUMN "issuedAt" DROP NOT NULL;
ALTER TABLE "Credential" ALTER COLUMN "issuedAt" DROP DEFAULT;
ALTER TABLE "Credential" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- 4) Migrate status TEXT -> ENUM using a NEW column (this avoids the default cast error)
ALTER TABLE "Credential"
  ADD COLUMN IF NOT EXISTS "status_new" "CredentialStatus" NOT NULL DEFAULT 'VERIFIED';

-- Map existing text values into enum (handles any case)
UPDATE "Credential"
SET "status_new" =
  CASE LOWER(COALESCE("status",''))
    WHEN 'verified' THEN 'VERIFIED'::"CredentialStatus"
    WHEN 'pending'  THEN 'PENDING'::"CredentialStatus"
    WHEN 'revoked'  THEN 'REVOKED'::"CredentialStatus"
    WHEN 'expired'  THEN 'EXPIRED'::"CredentialStatus"
    ELSE 'PENDING'::"CredentialStatus"
  END;

-- 5) Drop old status column (text) and replace with enum column
ALTER TABLE "Credential" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Credential" RENAME COLUMN "status_new" TO "status";

-- 6) Recreate index (drop if it exists first to be safe)
DROP INDEX IF EXISTS "Credential_walletAddress_status_expiresAt_idx";
CREATE INDEX "Credential_walletAddress_status_expiresAt_idx"
  ON "Credential"("walletAddress", "status", "expiresAt");