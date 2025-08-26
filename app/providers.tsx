"use client";
import dotenv from "dotenv";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

dotenv.config();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID!,
        walletConnectors: [EthereumWalletConnectors],
        recommendedWallets: [{ walletKey: "coinbase" }],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
