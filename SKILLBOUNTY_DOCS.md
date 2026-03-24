# SkillBounty — Full Project Documentation
> A trustless bounty board on Stellar. Post work, lock XLM, hunter delivers, auto-releases or arbitrator decides.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Full Feature List](#full-feature-list)
4. [Smart Contract Architecture](#smart-contract-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [File Structure](#file-structure)
7. [Pages & Components](#pages--components)
8. [Wallet Integration](#wallet-integration)
9. [Error Handling](#error-handling)
10. [Tests](#tests)
11. [CI/CD](#cicd)
12. [Environment Variables](#environment-variables)
13. [Commit Guide](#commit-guide)
14. [Belt Requirements Checklist](#belt-requirements-checklist)

---

## Project Overview

**SkillBounty** is a decentralized bounty board built on the Stellar blockchain using Soroban smart contracts.

### The Problem
When a freelancer delivers work digitally, there's always a trust gap:
- If the hunter delivers first → poster can steal the work and not pay
- If the poster pays first → hunter can ghost

### The Solution
A smart contract acts as escrow:
1. Poster locks XLM into the contract when posting a bounty
2. Hunter submits a work URL (GitHub, Figma, Notion, etc.)
3. Poster has 72 hours to approve or dispute
4. If approved → XLM releases to hunter automatically
5. If disputed → arbitrator wallet (platform owner) manually resolves
6. If poster ghosts (no response in 72hrs) → XLM auto-releases to hunter

### Why Stellar
- Transactions settle in 3-5 seconds
- Fees are fractions of a cent (viable for small bounties like 1 XLM)
- Soroban smart contracts are production-ready
- Cross-border: a hunter in India, poster in Germany — no friction

---

## Tech Stack

```
Frontend        Next.js 14 (App Router) + TypeScript
Styling         Tailwind CSS
Wallet          StellarWalletsKit (supports Freighter + multiple wallets)
Smart Contract  Soroban (Rust)
Stellar SDK     @stellar/stellar-sdk
Testing         Rust built-in tests (contract) + Jest (frontend)
CI/CD           GitHub Actions
Deployment      Vercel (frontend) + Stellar Testnet (contract)
```

---

## Full Feature List

### Wallet
- Connect wallet via StellarWalletsKit (supports Freighter, xBull, Lobstr, etc.)
- Disconnect wallet
- Display connected wallet address (truncated)
- Display live XLM balance
- Handle errors: wallet not installed, user rejected, insufficient balance

### Bounty Board
- View all open bounties (fetched from contract)
- Filter by status: Open, In Progress, Completed, Disputed
- Each bounty card shows: title, description, reward (XLM), poster address, status, time remaining

### Post a Bounty (Poster flow)
- Form: title, description, reward amount, deadline (default 72hrs after submission)
- Locks XLM into contract on submission
- Shows transaction status: pending → confirmed → live on board
- Shows transaction hash with Stellar Explorer link

### Claim & Submit Work (Hunter flow)
- Claim an open bounty (marks it as In Progress, locked to hunter wallet)
- Submit work URL (GitHub repo, Figma link, Notion doc, etc.)
- Starts the 72hr approval countdown visible to both parties

### Approve / Dispute (Poster flow)
- Approve work → contract releases XLM to hunter instantly
- Dispute work → contract freezes funds, flags for arbitration
- 72hr timer visible — auto-release warning shown at <24hrs remaining

### Arbitration (Admin flow)
- Admin dashboard (only visible to arbitrator wallet)
- Lists all disputed bounties
- View submitted work URL
- Release to hunter OR refund to poster with one click

### Reputation
- Each wallet has a public profile page
- Shows: bounties posted, bounties completed, total XLM earned, total XLM paid out
- Reputation score = completed bounties (on-chain, unfakeable)

### UX Details
- Loading states on all async operations
- Toast notifications for all transaction events
- Mobile responsive layout
- Transaction hash shown after every on-chain action
- Stellar Explorer links for all transactions and contract addresses

---

## Smart Contract Architecture

### Location
`/contract/` — Rust Soroban contract

### Data Structures

```rust
// Bounty status enum
pub enum BountyStatus {
    Open,
    InProgress,
    Submitted,
    Completed,
    Disputed,
    Refunded,
}

// Main bounty struct stored in contract
pub struct Bounty {
    pub id: u64,
    pub poster: Address,
    pub hunter: Option<Address>,
    pub title: String,
    pub description: String,
    pub reward: i128,          // in stroops (1 XLM = 10_000_000 stroops)
    pub work_url: Option<String>,
    pub status: BountyStatus,
    pub created_at: u64,
    pub submitted_at: Option<u64>,
    pub deadline_hours: u64,   // default 72
}
```

### Contract Functions

```rust
// Post a new bounty. Transfers XLM from poster to contract.
pub fn post_bounty(
    env: Env,
    poster: Address,
    title: String,
    description: String,
    reward: i128,
    deadline_hours: u64,
) -> u64  // returns bounty_id

// Hunter claims an open bounty
pub fn claim_bounty(
    env: Env,
    hunter: Address,
    bounty_id: u64,
)

// Hunter submits work URL — starts 72hr countdown
pub fn submit_work(
    env: Env,
    hunter: Address,
    bounty_id: u64,
    work_url: String,
)

// Poster approves work — releases XLM to hunter
pub fn approve_work(
    env: Env,
    poster: Address,
    bounty_id: u64,
)

// Poster disputes work — freezes funds, flags for arbitration
pub fn dispute_work(
    env: Env,
    poster: Address,
    bounty_id: u64,
)

// Auto-release: callable by anyone after deadline passes with no response
pub fn claim_timeout(
    env: Env,
    bounty_id: u64,
)

// Arbitrator only: resolve dispute in favour of hunter or poster
pub fn arbitrate(
    env: Env,
    arbitrator: Address,
    bounty_id: u64,
    release_to_hunter: bool,
)

// Read functions
pub fn get_bounty(env: Env, bounty_id: u64) -> Bounty
pub fn get_all_bounties(env: Env) -> Vec<Bounty>
pub fn get_bounties_by_poster(env: Env, poster: Address) -> Vec<Bounty>
pub fn get_bounties_by_hunter(env: Env, hunter: Address) -> Vec<Bounty>
pub fn get_reputation(env: Env, wallet: Address) -> u64
```

### Storage Keys
```rust
// Contract uses these storage keys
BOUNTY_COUNT         // u64 — total bounties ever created
BOUNTY_{id}          // Bounty struct — individual bounty data
REPUTATION_{address} // u64 — completed bounty count per wallet
ARBITRATOR           // Address — set once at contract init
```

### Contract Init
```rust
pub fn initialize(env: Env, arbitrator: Address)
// Called once on deployment. Sets arbitrator wallet.
// Your wallet address goes here.
```

---

## Frontend Architecture

### Location
`/` — Next.js app root

### State Management
Use React Context for:
- Connected wallet address
- XLM balance
- StellarWalletsKit instance

No Redux needed. Keep it simple.

### Key Libraries to Install
```bash
npm install @stellar/stellar-sdk
npm install @creit.tech/stellar-wallets-kit
npm install @soroban-react/core
```

---

## File Structure

```
skillbounty/
├── contract/                          # Soroban Rust contract
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs                     # Contract entry point
│       ├── bounty.rs                  # Bounty struct + impl
│       ├── storage.rs                 # Storage helpers
│       └── test.rs                    # Contract tests
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, wallet provider
│   │   ├── page.tsx                   # Homepage — bounty board
│   │   ├── post/
│   │   │   └── page.tsx               # Post a bounty page
│   │   ├── bounty/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Single bounty detail page
│   │   ├── profile/
│   │   │   └── [address]/
│   │   │       └── page.tsx           # Wallet reputation profile
│   │   └── admin/
│   │       └── page.tsx               # Arbitration dashboard (gated)
│   │
│   ├── components/
│   │   ├── WalletButton.tsx           # Connect/disconnect + balance display
│   │   ├── BountyCard.tsx             # Card shown on board
│   │   ├── BountyList.tsx             # Grid of BountyCards with filters
│   │   ├── PostBountyForm.tsx         # Form to post new bounty
│   │   ├── SubmitWorkForm.tsx         # Hunter submits work URL
│   │   ├── ApproveDisputeButtons.tsx  # Poster action buttons
│   │   ├── ArbitrationPanel.tsx       # Admin dispute resolver
│   │   ├── ReputationBadge.tsx        # Shows completed bounty count
│   │   ├── TransactionToast.tsx       # Toast for tx events
│   │   ├── StatusBadge.tsx            # Coloured status pill
│   │   ├── CountdownTimer.tsx         # 72hr countdown display
│   │   └── Navbar.tsx                 # Top nav with wallet button
│   │
│   ├── context/
│   │   └── WalletContext.tsx          # Global wallet state
│   │
│   ├── lib/
│   │   ├── stellar.ts                 # Stellar SDK helpers
│   │   ├── contract.ts                # Contract call wrappers
│   │   └── constants.ts              # Contract address, network config
│   │
│   └── types/
│       └── bounty.ts                  # TypeScript types matching contract structs
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI
│
├── .env.local                         # Environment variables
├── README.md                          # Project README
└── package.json
```

---

## Pages & Components

### Homepage `/`
- Navbar with wallet connect button
- Hero: "Post work. Lock XLM. Pay on delivery."
- Filter tabs: All / Open / In Progress / Completed / Disputed
- Grid of BountyCards
- Floating "Post Bounty" button (only visible when wallet connected)

### Post Bounty `/post`
- Requires wallet connected (redirect if not)
- Form fields: Title, Description (markdown), Reward (XLM input), Deadline hours (default 72)
- Shows estimated USD value next to XLM amount
- Submit button triggers contract call
- After success: redirect to bounty detail page

### Bounty Detail `/bounty/[id]`
This page is context-aware — shows different UI depending on who is viewing:

**If viewer = poster:**
- See submitted work URL (after hunter submits)
- Approve / Dispute buttons
- 72hr countdown
- If disputed: "Under arbitration" state

**If viewer = hunter (and bounty is open):**
- Claim Bounty button
- After claiming: Submit Work form

**If viewer = hunter (and already claimed by them):**
- Submit Work form
- After submitting: waiting state with countdown

**If viewer = anyone else:**
- Read-only view
- Bounty details, status, reward

### Profile `/profile/[address]`
- Wallet address (truncated + copy button)
- Reputation score (completed bounties)
- Stats: total earned, total paid out
- List of bounties posted and completed

### Admin `/admin`
- Only renders if connected wallet = ARBITRATOR_ADDRESS from env
- Shows all disputed bounties
- Each dispute shows: poster, hunter, work URL, reward amount
- Two buttons: "Release to Hunter" / "Refund to Poster"

---

## Wallet Integration

### Setup StellarWalletsKit

```typescript
// src/context/WalletContext.tsx

import { StellarWalletsKit, WalletNetwork, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit'

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
})
```

### Connect Flow
```typescript
await kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id)
    const { address } = await kit.getAddress()
    // save address to context
  }
})
```

### Get Balance
```typescript
import { Horizon } from '@stellar/stellar-sdk'

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const account = await server.loadAccount(address)
const xlmBalance = account.balances.find(b => b.asset_type === 'native')?.balance
```

### Error Types to Handle (required for Yellow Belt)
```typescript
// 1. Wallet not installed
if (!window.freighter) throw new Error('WALLET_NOT_FOUND')

// 2. User rejected transaction
if (error.message.includes('User declined')) throw new Error('USER_REJECTED')

// 3. Insufficient balance
if (error.message.includes('op_underfunded')) throw new Error('INSUFFICIENT_BALANCE')
```

---

## Tests

### Contract Tests (Rust) — minimum 3 required

```rust
// contract/src/test.rs

#[test]
fn test_post_bounty_creates_entry() { ... }

#[test]
fn test_claim_bounty_changes_status() { ... }

#[test]
fn test_approve_work_releases_funds() { ... }

#[test]
fn test_timeout_releases_to_hunter() { ... }

#[test]
fn test_only_arbitrator_can_arbitrate() { ... }
```

Run with:
```bash
cd contract
cargo test
```

### Frontend Tests (Jest) — optional but good to have
```bash
npm run test
```

---

## CI/CD

### GitHub Actions — `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown
      - name: Run contract tests
        run: |
          cd contract
          cargo test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install deps
        run: npm install
      - name: Run frontend tests
        run: npm test -- --passWithNoTests
```

Add CI badge to README:
```markdown
![CI](https://github.com/YOUR_USERNAME/skillbounty/actions/workflows/ci.yml/badge.svg)
```

---

## Environment Variables

```bash
# .env.local

NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ADDRESS=        # Fill after deploying contract
NEXT_PUBLIC_ARBITRATOR_ADDRESS=      # Your wallet address
```

---

## Commit Guide

Make these commits in order. Each one is real and meaningful:

```
1.  feat: scaffold next.js app with tailwind and typescript
2.  feat: add wallet connect and disconnect via stellarwalletskit
3.  feat: display xlm balance for connected wallet
4.  feat: add send xlm transaction with success/fail feedback
5.  feat: write soroban bounty contract with post and claim functions
6.  feat: add submit work and approve/dispute to contract
7.  feat: add timeout auto-release and arbitration to contract
8.  test: add unit tests for contract functions
9.  feat: deploy contract to testnet and wire up frontend
10. feat: add bounty board homepage with filter tabs
11. feat: add post bounty form with contract integration
12. feat: add bounty detail page with role-aware ui
13. feat: add arbitration admin dashboard
14. feat: add wallet reputation and profile page
15. ci: add github actions workflow for contract and frontend tests
16. feat: make all pages mobile responsive
17. docs: complete readme with screenshots and demo video
```

Each commit should have actual code changes. Don't batch unrelated things. Don't use `fix stuff` or `update`.

---

## Belt Requirements Checklist

### White Belt ✓
- [x] Freighter wallet setup on testnet
- [x] Connect wallet
- [x] Disconnect wallet
- [x] Fetch and display XLM balance
- [x] Send XLM transaction
- [x] Show success/fail + transaction hash
- [x] Public GitHub repo
- [x] README with screenshots

### Yellow Belt ✓
- [x] StellarWalletsKit (multi-wallet support)
- [x] 3 error types handled (not found, rejected, underfunded)
- [x] Contract deployed on testnet
- [x] Contract called from frontend
- [x] Transaction status visible (pending → confirmed)
- [x] 2+ meaningful commits
- [x] README: deployed contract address + tx hash

### Orange Belt ✓
- [x] Mini-dApp fully functional end to end
- [x] 3+ passing tests
- [x] Complete README
- [x] Live demo link (Vercel)
- [x] Demo video (1 minute)
- [x] 3+ meaningful commits

### Green Belt ✓
- [x] Inter-contract calls (reputation contract called from bounty contract)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Mobile responsive
- [x] 8+ meaningful commits
- [x] README: CI badge, mobile screenshot, contract addresses

---

## README Template

Copy this as your README.md and fill in the blanks:

```markdown
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

## Screenshots
[wallet connected] [bounty board] [post bounty] [mobile view] [CI passing] [tests passing]

## Setup

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/skillbounty
cd skillbounty
npm install
cp .env.local.example .env.local
# fill in env vars
npm run dev
\`\`\`

## Contract Deployment

\`\`\`bash
cd contract
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/skillbounty.wasm --network testnet
\`\`\`

## Tests

\`\`\`bash
cd contract && cargo test
\`\`\`
```

---

*Built for the Stellar Builder Programme — SkillBounty uses Stellar's speed and near-zero fees to make trustless freelance payments actually viable.*
