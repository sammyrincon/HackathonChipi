# ZeroPass — Portable Compliance Credentials

ZeroPass is a hackathon demo for **portable compliance credentials** on Starknet. Users complete a simulated KYC once and receive a verifiable credential linked to their wallet. Verifiers can check credential status at `/verify` (no sign-in). No RPC or real funds required in demo mode.

**Stack:** Next.js (App Router), TypeScript, Prisma, Clerk, Chipi Provider.

## What is ZeroPass?

- **User flow:** Sign in (Clerk) → complete simulated KYC at `/kyc` → credential is issued (VERIFIED) with 30-day expiry, linked to wallet.
- **Verifier flow:** Go to `/verify` → enter wallet address or paste/scan QR payload `{"walletAddress":"0x..."}` → get VERIFIED / NOT VERIFIED.
- **Dashboard:** View credential status, expiry, wallet, QR code; revoke credential.
- **Demo mode:** Set `NEXT_PUBLIC_DEMO_MODE=true` and `DEMO_MODE=true` to skip real payment; backend accepts `0xDEMO_*` tx hash and issues VERIFIED credential without RPC or funds.

## Local setup

1. **Clone and install**

   ```bash
   git clone https://github.com/sammyrincon/HackathonChipi.git
   cd HackathonChipi
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Postgres connection string (e.g. Supabase) |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
   | `CLERK_SECRET_KEY` | Clerk secret key |
   | `NEXT_PUBLIC_DEMO_MODE` | `true` for hackathon demo (skip real transfer) |
   | `DEMO_MODE` | `true` so backend accepts `0xDEMO_*` tx hash |
   | `NEXT_PUBLIC_CHIPI_API_KEY` | Chipi API key (optional in demo mode) |
   | `NEXT_PUBLIC_MERCHANT_WALLET` | Starknet address for payments (optional in demo mode) |

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

## Demo in 60 seconds (checklist)

- [ ] Set `NEXT_PUBLIC_DEMO_MODE=true` and `DEMO_MODE=true` in `.env.local`, restart dev server.
- [ ] Open `/` → sign in with Clerk.
- [ ] Go to **/kyc** → upload any ID + selfie (demo, not stored) → **Continue to payment**.
- [ ] Click **Complete KYC (Demo)** (no real transfer) → see **Credential issued ✅**.
- [ ] Go to **/dashboard** → see credential, expiry, wallet; expand **My ZeroPass QR** (payload `{ walletAddress }`); click **Revoke credential** to test revoke.
- [ ] Open **/verify** in another tab (or incognito) → paste wallet address or paste QR payload `{"walletAddress":"0x..."}` → **Verify** → see **Verified** or **Not verified**.

## API (Zod-validated)

- `POST /api/kyc` (auth) — body: `{ walletAddress, transactionHash?, kycData? }`. Upsert credential; if `verifyPayment` accepts tx (e.g. `0xDEMO_*` in demo mode), status = VERIFIED, 30-day expiry. Response: `{ ok, status, expiresAt, walletAddress, ... }`.
- `GET /api/kyc/status` (auth) — credential for user or NONE.
- `POST /api/kyc/revoke` (auth) — set status REVOKED, set revokedAt.
- `POST /api/kyc/verify` (public, rate-limited) — body: `{ walletAddress }`. Response: `{ verified, reason?, expiresAt? }`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check

## Deploy

1. Set env vars (no `DEMO_MODE` in production if you want real payments).
2. `npx prisma migrate deploy`
3. `npm run build && npm run start`
