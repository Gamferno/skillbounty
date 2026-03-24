# SkillBounty

> A trustless bounty board on Stellar. Post work, lock XLM, pay on delivery.

![CI](https://github.com/YOUR_USERNAME/skillbounty/actions/workflows/ci.yml/badge.svg)

## Live Demo
[skillbounty.vercel.app](https://skillbounty.vercel.app)

## Demo Video
[Watch 1-min demo](https://loom.com/YOUR_LINK)

## What it does
SkillBounty lets anyone post a task with XLM locked as reward.
A hunter completes the work and submits a link. The poster approves
and funds release instantly. If the poster ghosts, funds auto-release
after 72 hours. Disputes are resolved by the platform arbitrator.

## Contract
- **Network:** Stellar Testnet
- **Contract Address:** `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- **Sample Transaction:** `[tx hash on stellar.expert]`

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Wallet:** StellarWalletsKit (Freighter + multi-wallet)
- **Smart Contract:** Soroban (Rust)
- **Stellar SDK:** @stellar/stellar-sdk
- **Testing:** Rust built-in tests + Jest
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (frontend) + Stellar Testnet (contract)

## Screenshots
[wallet connected] [bounty board] [post bounty] [mobile view] [CI passing] [tests passing]

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/skillbounty
cd skillbounty
npm install
cp .env.local.example .env.local
# fill in env vars
npm run dev
```

## Environment Variables

```bash
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ADDRESS=        # Fill after deploying contract
NEXT_PUBLIC_ARBITRATOR_ADDRESS=      # Your wallet address
```

## Contract Deployment

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/skillbounty.wasm --network testnet
```

## Tests

```bash
# Contract tests
cd contract && cargo test

# Frontend tests
npm test
```
