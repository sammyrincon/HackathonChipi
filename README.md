# ZeroPass (Hackathon Chipi)

ZeroPass issues a privacy-preserving credential on Starknet. Users complete KYC once, pay a one-time fee (1 USDC), and receive a verifiable credential linked to their Chipi wallet. Merchants and verifiers can check credential validity at `/verify` without sign-in.

**Stack:** Next.js (App Router), TypeScript, Prisma, Clerk, Chipi Provider.

## Architecture

- **Auth:** Clerk (sign-in/sign-up). Routes `/kyc` and `/dashboard` require auth.
- **Credentials:** Stored in Postgres via Prisma. Status: `PENDING` → `VERIFIED` (after payment) → optional `REVOKED` / `EXPIRED`.
- **Payment:** Chipi for real 1 USDC; in dev, set `ALLOW_FAKE_PAYMENTS=true` to simulate payment with a fake tx hash (`0xsim`).
- **Verification:** Public `POST /api/kyc/verify` (rate-limited) and public page `/verify` for wallet address or QR/paste payload.

## Demo flow

### User

1. Sign in with Clerk.
2. Go to **/kyc**. Complete the simulated KYC (upload step is demo; no real docs stored).
3. **Payment:** Either “Pay 1 USDC” (Chipi) or “Simulate payment (dev only)” when `NEXT_PUBLIC_ALLOW_FAKE_PAYMENTS=true`.
4. After payment (or simulated payment), credential becomes **VERIFIED** with 30-day expiry.
5. Go to **/dashboard** to see status, expiry, wallet, and QR. Use **Revoke** to revoke the credential.

### Verifier (no sign-in)

1. Go to **/verify**.
2. Enter wallet address and click **Verify**, or scan QR / paste JSON payload `{"walletAddress":"0x..."}`.
3. Result: **Verified** (with credential ID and expiry) or **Not verified** (with reason).

## Local setup

1. **Clone and install**

   ```bash
   git clone https://github.com/sammyrincon/HackathonChipi.git
   cd HackathonChipi
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `DATABASE_URL` — Postgres connection string (e.g. Supabase).
   - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and sign-in/sign-up URLs if needed.
   - Chipi: `NEXT_PUBLIC_CHIPI_API_KEY`, `NEXT_PUBLIC_MERCHANT_WALLET` (Starknet address for receiving 1 USDC).

3. **Database**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Simulating payments (dev only)

- Set in `.env.local`:
  - `ALLOW_FAKE_PAYMENTS=true`
  - `NEXT_PUBLIC_ALLOW_FAKE_PAYMENTS=true`
- Restart the dev server.
- On **/kyc** payment step, the “Simulate payment (dev only)” button appears. Click it to submit a fake tx hash; the backend will set the credential to **VERIFIED** and set `issuedAt` / `expiresAt` (30 days).
- **Production:** Leave these unset. `verifyPayment()` then returns `false`; credentials stay **PENDING** unless a real payment is verified.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm run format` — Prettier (requires `prettier` installed)

## Deploy

1. Set all env vars in your host (Vercel, etc.), including `DATABASE_URL`, Clerk, Chipi, and merchant wallet. Do **not** set `ALLOW_FAKE_PAYMENTS` in production.
2. Run migrations: `npx prisma migrate deploy`.
3. Build and start: `npm run build && npm run start`.
