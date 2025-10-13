# 🐾 Travel Kitty — Web App (Next.js 15)

**Travel Kitty** is an alpha-stage group expense splitter for trips and friends.
It records split bills **on-chain (Base Sepolia)**, stores **receipt data on IPFS (Helia)**, and supports optional mock on-chain settlement with **mUSD**.

> ⚠️ **Alpha notice** — This is a hackathon demo. Contracts & code are unaudited. Do not use on mainnet.

---

## 🚀 What this app does

- **Wallet connect** (RainbowKit + wagmi) on **Base Sepolia**
- **Join a trip** (on-chain `join()`)
- **Add expense** with:

  - OCR JSON / receipt image uploaded to **IPFS via Helia** → **CID**
  - On-chain `addExpense(amountUsd6, cid, splitWith[])`

- **Mock settlement** (approve mUSD → `settleToken()`)
- **Off-chain history** (Supabase + Prisma) for lists/filters
- Clean, minimal **Next.js 15 App Router** UX with **TailwindCSS**

---

## 🧰 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Web3**: wagmi + viem, RainbowKit, Base Sepolia
- **IPFS**: Helia (`helia` + `@helia/unixfs`) — browser node
- **Data**: Supabase Postgres + Prisma (server actions/route handlers)
- **Server-state**: React Query
- **AI/OCR**: optional via OpenRouter (vision model) — stubbed in demo API

---

## 🗂 Project structure

```
travel-kitty-web/
├─ app/
│  ├─ api/ocr/route.ts        # (optional) OCR proxy (stub)
│  ├─ globals.css
│  ├─ layout.tsx              # App providers (wagmi, RainbowKit, React Query)
│  └─ page.tsx                # Home (Join, Faucet, Add Expense, Settle)
├─ lib/
│  ├─ wagmi.ts                # chain config
│  ├─ contracts.ts            # addresses + ABIs
│  ├─ helia.ts                # Helia + unixfs helpers
│  ├─ react-query.tsx         # QueryClient provider
│  ├─ prisma.ts               # Prisma client (server)
│  └─ supabase.ts             # Supabase client (browser)
├─ prisma/
│  └─ schema.prisma           # Trip, TripMember, Expense
├─ public/
├─ next.config.ts
├─ package.json
└─ tsconfig.json
```

---

## 🔑 Environment variables

Create **`.env.local`** in the repo root:

```bash
# Chain
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>

# Deployed contract addresses (from contracts repo or broadcast/_addresses_84532.json)
NEXT_PUBLIC_TRAVEL_KITTY=0x...
NEXT_PUBLIC_MOCK_USD=0x...
NEXT_PUBLIC_FAUCET=0x...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON=<public-anon-key>
SUPABASE_SERVICE_ROLE=<service-role-key>   # only for server actions if needed

# Optional OCR via OpenRouter
OPENROUTER_API_KEY=sk-...
OPENROUTER_MODEL=openai/gpt-4o-mini
```

And set **`DATABASE_URL`** for Prisma (Supabase → Settings → Database):

```
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<host>.supabase.co:5432/postgres"
```

> Keep `SERVICE_ROLE` & `DATABASE_URL` **server-only** (not exposed to client).

---

## 🛠️ Install & run

```bash
# 1) Install deps
npm i

# 2) Init Prisma schema to your Supabase DB
npx prisma db push

# 3) Dev server
npm run dev

# Build & start
npm run build
npm start
```

---

## 🔗 Contracts used (Base Sepolia)

Fill envs from your contracts repo (or manually):

- **TravelKitty** — `NEXT_PUBLIC_TRAVEL_KITTY=0x...`
- **MockUSD (mUSD)** — `NEXT_PUBLIC_MOCK_USD=0x...`
- **MockUSDFaucet** — `NEXT_PUBLIC_FAUCET=0x...`

> If you used Foundry script that writes `broadcast/_addresses_84532.json`, you can copy those addresses here.

---

## 🧭 User flow (demo)

1. **Connect wallet** (RainbowKit) on **Base Sepolia**
2. **Join trip** → calls `TravelKitty.join()`
3. **Claim mUSD** (rate-limited faucet)
4. **Add expense**

   - Uploads receipt JSON (or image) to **IPFS (Helia)** → **CID**
   - Calls `TravelKitty.addExpense(amountUsd6, cid, splitWith[])`

5. **Settle (optional)**

   - `approve(mUSD, kitty, amount)` then `settleToken(creditor, amount, mUSD)`

6. **History** stored in Supabase (off-chain list + filters)

---

## 🧩 Key Files

### `lib/contracts.ts` (addresses + ABI)

```ts
export const ADDR = {
  TRAVEL_KITTY: process.env.NEXT_PUBLIC_TRAVEL_KITTY as `0x${string}`,
  MOCK_USD: process.env.NEXT_PUBLIC_MOCK_USD as `0x${string}`,
  FAUCET: process.env.NEXT_PUBLIC_FAUCET as `0x${string}`,
};

// travelKittyAbi, erc20Abi, faucetAbi … (see file)
```

### `lib/helia.ts` (IPFS)

Creates a browser Helia node and exposes `putToIpfs(data)` that returns a **CID** string.

### `app/page.tsx`

Landing with **Join**, **Faucet**, **Add Expense** (→ IPFS + on-chain), **Settle** actions.

---

## 🧮 Data model (Prisma)

```prisma
model User      { id String @id @default(cuid()); wallet String @unique; createdAt DateTime @default(now()); trips TripMember[] }
model Trip      { id String @id @default(cuid()); name String; owner String; createdAt DateTime @default(now()); members TripMember[]; expenses Expense[] }
model TripMember{ id String @id @default(cuid()); tripId String; wallet String; joinedAt DateTime @default(now()); trip Trip @relation(fields:[tripId], references:[id]) }
model Expense   { id String @id @default(cuid()); tripId String; payer String; amountUsd6 Int; cid String; txHash String?; createdAt DateTime @default(now()); trip Trip @relation(fields:[tripId], references:[id]) }
```

Populate via **server actions** after a successful on-chain call (see `app/actions.ts`).

---

## 🧪 How to demo (judge flow)

1. Open app → **Connect wallet** (Base Sepolia)
2. Click **Join Trip** → show tx in Basescan
3. Click **Claim mUSD** → see balance in MetaMask
4. Select a small **receipt** (or use demo JSON), click **Add Expense**

   - Show **IPFS CID** in tx input
   - Open **Basescan** link for the tx

5. Paste creditor address, click **Approve + Settle** to send mUSD and reduce balances
6. Show **Supabase table** updating (expenses list)

---

## 🧷 Security notes

- Do **not** expose service keys to the client.
- All contracts & app code is **for demo**. No guarantees.
- Helia runs a browser IPFS node; for production you’d pin through a gateway/pinning service.

---

## 🐞 Troubleshooting

- **“wrong network”** → wallet must be **Base Sepolia (84532)**
- **“execution reverted NOT_MEMBER”** → call **Join** first
- **Faucet fails** → faucet has cooldown; wait or use a 2nd account
- **IPFS errors** → check browser permissions; retry (Helia boot takes a moment)

---

## 📦 NPM Scripts

```json
{
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start",
  "prisma:push": "prisma db push",
  "prisma:studio": "prisma studio"
}
```

## ⚖️ License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
