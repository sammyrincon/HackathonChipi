-- CreateTable
CREATE TABLE "UserWalletSecret" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWalletSecret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWalletSecret_clerkUserId_key" ON "UserWalletSecret"("clerkUserId");

-- CreateIndex
CREATE INDEX "UserWalletSecret_clerkUserId_idx" ON "UserWalletSecret"("clerkUserId");
