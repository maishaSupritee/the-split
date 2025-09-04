"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { Address } from "viem";
import { encodeFunctionData, parseEther, parseUnits, type Hex } from "viem";
import { baseSepolia } from "viem/chains";

// Base Sepolia USDC (testnet) – 6 decimals
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

//function to ask the USDC contract to move tokens
const erc20 = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export type WalletCapabilities = {
  atomic?: "supported" | "unsupported" | "unknown";
  sponsored?: "supported" | "unsupported" | "unknown";
};

export function usePayOnce() {
  const { primaryWallet } = useDynamicContext();

  async function getWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Connect an EVM wallet first");
    }

    // returns a Viem Wallet Client
    const walletClient = await primaryWallet.getWalletClient();

    // nudge to Base Sepolia so users don’t have to switch manually
    try {
      await walletClient.switchChain({ id: baseSepolia.id });
    } catch {
      // incase the wallet rejects, we’ll still try to send — the chain pin on sendCalls will error clearly
    }

    return walletClient; //need this client to send transactions and to use EIP-5792 batch calls
  }

  // read EIP-5792 capabilities for this account & chain
  async function getCapabilities(): Promise<WalletCapabilities> {
    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    try {
      // some wallets expose capabilities per chain id
      const caps = await walletClient.getCapabilities({ account });
      const chainCaps =
        (caps as Record<string, any>)?.[baseSepolia.id as unknown as Hex] ??
        (caps as Record<string, any>)?.[baseSepolia.id];
      // makinng it better for UI
      const atomic =
        chainCaps?.atomic?.status ?? chainCaps?.batching?.status ?? "unknown";
      const sponsored =
        chainCaps?.paymasterService?.status ??
        chainCaps?.sponsorship?.status ??
        "unknown";

      return {
        atomic: (atomic as WalletCapabilities["atomic"]) ?? "unknown",
        sponsored: (sponsored as WalletCapabilities["sponsored"]) ?? "unknown",
      };
    } catch {
      return { atomic: "unknown", sponsored: "unknown" };
    }
  }

  // ETH split: bundle native transfers
  async function payOnceETH(recipients: { to: Address; amountEth: string }[]) {
    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    const calls = recipients.map(({ to, amountEth }) => ({
      to,
      value: parseEther(amountEth),
    }));

    // one-line batch with automatic fallback if 5792 not supported
    // sendCalls - EIP-5792 way to send multiple calls at once
    // experimental_fallback - if the smart wallet does not support batch calls, it will send the transactions one by one
    return walletClient.sendCalls({
      account,
      chain: baseSepolia,
      calls,
      experimental_fallback: true,
    });
  }

  // USDC split: bundle ERC-20 transfers
  async function payOnceUSDC(
    recipients: { to: Address; amountUsdc: string }[]
  ) {
    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    const calls = recipients.map(({ to, amountUsdc }) => ({
      to: USDC_BASE_SEPOLIA,
      data: encodeFunctionData({
        abi: erc20,
        functionName: "transfer",
        // USDC has 6 decimals on Base Sepolia (testnet)
        // multiply amount by 1e6 to convert to smallest unit
        args: [to, parseUnits(amountUsdc, 6)],
      }),
    }));

    return walletClient.sendCalls({
      account,
      chain: baseSepolia,
      calls,
      experimental_fallback: true,
    });
  }

  return { payOnceETH, payOnceUSDC, getCapabilities };
}
