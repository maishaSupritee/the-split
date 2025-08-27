"use client";
import Header from "../components/header";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import SplitBill from "../components/splitBill";

export default function Home() {
  const { primaryWallet, user } = useDynamicContext();

  // Show SplitBillif user is authenticated
  if (user && primaryWallet) {
    return <SplitBill />;
  }
  // else show landing page if not authenticated
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 -z-10" />
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-6 sm:space-y-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              <span className="hidden sm:inline">
                Powered by ERC-4337 & Coinbase Smart Wallet
              </span>
              <span className="sm:hidden">ERC-4337 & Smart Wallet</span>
            </div>

            <div className="space-y-4">
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                Send crypto to multiple recipients in a single transaction. Save
                on gas fees with smart wallet batching technology.
              </p>

              <p className="text-base sm:text-lg text-muted-foreground/80">
                Connect your wallet to get started
              </p>
            </div>

            <div className="flex justify-center items-center pt-4 sm:pt-6">
              <div className="max-w-sm">
                <DynamicWidget />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
