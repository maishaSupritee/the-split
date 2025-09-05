# The Split — Batch payouts with Dynamic + EIP-5792

> One-click batch transfers of ETH or USDC to multiple recipients using **Dynamic** for auth/wallet UX and **EIP-5792** for batching (with graceful fallback). Runs on **Base Sepolia** (testnet) by default.

## ✨ Features

- **Login with wallet** via Dynamic’s `DynamicWidget` and `useDynamicContext`
- **Batch sends** with `walletClient.sendCalls` (EIP-5792) and `experimental_fallback` for wallets with no batching capabilities
- **ETH or USDC** (Base Sepolia) in one flow
- **Auto network switch** to Base Sepolia using `walletClient.switchChain`
- **Capabilities detection** (shows if atomic batching or sponsored gas is supported)
- **Safe inputs**: EVM address validation (`isAddress`) + precise decimals via `parseUnits`
- **Clean, responsive UI** (Next.js + Tailwind + shadcn/ui + lucide)

## 🧱 Tech Stack

- **Next.js / React**, **TypeScript**, **Tailwind**, **shadcn/ui**
- **Dynamic** (`@dynamic-labs/sdk-react-core`, `@dynamic-labs/ethereum`)
- **Viem** for wallet RPCs / batching (`sendCalls`, `switchChain`, `getCapabilities`)
- **Base Sepolia** testnet (USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`)

## 🚀 Quickstart

### Prereqs

- Node 18+
- A [Dynamic project](https://www.dynamic.xyz) : get your **Environment ID** from the dashboard

### Clone & install

```bash
git clone git@github.com:maishaSupritee/the-split.git
cd the-split
npm i
```

### Create a .env file in root directory

```bash
NEXT_PUBLIC_DYNAMIC_ENV_ID=your_env_id_here
```

### Run the server

```bash
npm run dev
```

## Testing

### Open the app at: http://localhost:3000

- Switch your wallet to Base Sepolia Testnet (the app also nudges automatically).
- Get Base Sepolia ETH + USDC (testnet) from a faucet.
- Add 2–3 recipients, enter small amounts (e.g., 0.00003 ETH or 0.25 USDC), and click Pay Once.

### ✅ Future Iterations / Roadmap

- Show per-call receipts
- Split between more recipients
- Allow users to create groups and connect each group member's wallets, creating group expenses to split between the members
