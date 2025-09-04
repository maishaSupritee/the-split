"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { Address } from "viem";
import { encodeFunctionData, parseEther, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";

// Base Sepolia USDC (testnet) – decimals: 6
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

export function usePayOnce() {
  const { primaryWallet } = useDynamicContext();

  async function getWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Connect an EVM wallet first");
    }

    // Returns a Viem Wallet Client.
    const walletClient = await primaryWallet.getWalletClient();
    return walletClient; //need this client to send transactions and to use EIP-5792 batch calls
  }

  // ETH split: bundle native transfers
  async function payOnceETH(recipients: { to: Address; amountEth: string }[]) {
    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    const calls = recipients.map(({ to, amountEth }) => ({
      to,
      value: parseEther(amountEth),
    }));

    // One-line batch with automatic fallback:
    // sendCalls - EIP-5792 way to send multiple calls at once
    // experimental_fallback - if the smart wallet does not support batch calls, it will send the transactions one by one
    const res = await walletClient.sendCalls({
      account,
      chain: baseSepolia,
      calls,
      experimental_fallback: true,
    });

    return res; // { id, capabilities? }
  }

  // USDC split: bundle ERC-20 transfers - builds contract calls to USDC contract
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

    const res = await walletClient.sendCalls({
      account, // explicit sender
      chain: baseSepolia, // pin testnet
      calls,
      experimental_fallback: true,
    });

    return res;
  }

  return { payOnceETH, payOnceUSDC };
}
