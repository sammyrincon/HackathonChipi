

**ZeroPass: Portable Compliance Credentials**

ZeroPass is a Starknet-based prototype for portable compliance credentials. Instead of repeating KYC across platforms, 
users verify once and receive a reusable credential linked to their wallet. 
Businesses can instantly verify credential status without accessing personal data.
 
**The Problem**

Every time someone interacts with:

   - Financial platforms

   - On-chain services

   - Regulated marketplaces

They must choose between:

  - Privacy

  - Compliance

Most systems expose too much personal data or duplicate KYC processes.



**The Solution**

ZeroPass introduces:

   - A reusable compliance credential

   - Wallet-linked identity verification

   - Instant status checks for businesses

   - No personal data shared during verification

Verification only returns:

VERIFIED / NOT VERIFIED
+ Expiry date

Nothing else.

**Stack:** Next.js (App Router), TypeScript, Prisma, Clerk, Chipi Provider.

** What is ZeroPass?
**
- **User flow:** Sign in (Clerk) → complete simulated KYC at `/kyc` → credential is issued (VERIFIED) with 30-day expiry, linked to wallet.
- **Verifier flow:** Go to `/verify` → enter wallet address or paste/scan QR payload `{"walletAddress":"0x..."}` → get VERIFIED / NOT VERIFIED.
- **Dashboard:** View credential status, expiry, wallet, QR code; revoke credential.
- **Demo mode:** Set `NEXT_PUBLIC_DEMO_MODE=true` and `DEMO_MODE=true` to skip real payment; backend accepts `0xDEMO_*` tx hash and issues VERIFIED credential without RPC or funds.


   ```


## Demo in 60 seconds (checklist)

   1. Sign in

   2. Complete simulated KYC

   3. Receive credential (30-day validity)

   4. Open /verify

   5. Paste wallet or scan QR

   6. See instant verification

Demo mode requires no real transaction.


**Why It Matters**

   - Reduces repeated KYC friction

   - Preserves user privacy

   - Enables portable compliance

   - Aligns with zero-knowledge identity infrastructure

Vision

ZeroPass evolves into a privacy-preserving compliance layer for Web3 and regulated digital platforms.

A future where identity verification is:

   - Reusable

   - Private

   - Instant

   - Composable



**Local setup
**
1. **Clone and install**

   ```bash
   git clone https://github.com/sammyrincon/HackathonChipi.git
   cd HackathonChipi
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:
   
    `DATABASE_URL` | Postgres connection string (e.g. Supabase) |
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
    `CLERK_SECRET_KEY` | Clerk secret key |
 `NEXT_PUBLIC_DEMO_MODE` | `true` for hackathon demo (skip real transfer) |
    `DEMO_MODE` | `true` so backend accepts `0xDEMO_*` tx hash |
    `NEXT_PUBLIC_CHIPI_API_KEY` | Chipi API key (optional in demo mode) |
    `NEXT_PUBLIC_MERCHANT_WALLET` | Starknet address for payments (optional in demo mode) |

   **Voyager:** Wallet links use Voyager mainnet (voyager.online) only. The contract may not appear until the first on-chain transaction (counterfactual deployment).

3. **Database**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Run**

   ```bash
   npm run dev

