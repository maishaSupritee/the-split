"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, X, Users, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePayOnce, type WalletCapabilities } from "@/hooks/usePayOnce";
import { isAddress } from "viem";
import type { Address } from "viem";
import Header from "./header";

interface Recipient {
  id: string;
  address: string;
  amount: string;
}

export default function SplitBill() {
  const [selectedAsset, setSelectedAsset] = useState<"ETH" | "USDC">("ETH");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", address: "", amount: "" },
    { id: "2", address: "", amount: "" },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [totalAmount, setTotalAmount] = useState("0");
  const [caps, setCaps] = useState<WalletCapabilities>({
    atomic: "unknown",
    sponsored: "unknown",
  });

  const { payOnceETH, payOnceUSDC, getCapabilities } = usePayOnce();

  // fetch capabilities once the component mounts (after wallet connect)
  useEffect(() => {
    getCapabilities()
      .then(setCaps)
      .catch(() => {});
  }, [getCapabilities]);

  //  total amount calculation
  useEffect(() => {
    const total = recipients.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0
    );
    setTotalAmount(total.toFixed(6));
  }, [recipients]);

  // check validation errors per row
  // if address is non-empty but invalid, or amount is non-empty but invalid
  // useMemo to avoid re-calculating on every render
  const rowErrors = useMemo(() => {
    return recipients.map((r) => ({
      invalidAddress: r.address.trim().length > 0 && !isAddress(r.address),
      invalidAmount:
        r.amount.trim().length > 0 &&
        (isNaN(Number(r.amount)) || Number(r.amount) <= 0),
    }));
  }, [recipients]);

  const canSubmit = useMemo(() => {
    const allOk =
      recipients.length >= 2 &&
      recipients.every(
        (r, i) =>
          isAddress(r.address) &&
          r.amount.trim().length > 0 &&
          Number(r.amount) > 0 &&
          !rowErrors[i].invalidAddress &&
          !rowErrors[i].invalidAmount
      ) &&
      parseFloat(totalAmount) > 0;
    return allOk && !isProcessing;
  }, [recipients, rowErrors, totalAmount, isProcessing]);

  const addRecipient = () => {
    if (recipients.length < 3) {
      setRecipients((prev) => [
        ...prev,
        { id: Date.now().toString(), address: "", amount: "" },
      ]);
    }
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 2) {
      setRecipients((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const updateRecipient = (
    id: string,
    field: "address" | "amount",
    value: string
  ) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handlePayOnce = async () => {
    if (!canSubmit) return;
    setIsProcessing(true);
    setTransactionStatus("idle");

    try {
      if (selectedAsset === "ETH") {
        await payOnceETH(
          recipients.map((r) => ({
            to: r.address as Address,
            amountEth: r.amount,
          }))
        );
      } else {
        await payOnceUSDC(
          recipients.map((r) => ({
            to: r.address as Address,
            amountUsdc: r.amount,
          }))
        );
      }
      setTransactionStatus("success");
    } catch (err) {
      console.error(err);
      setTransactionStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  // capability badge component
  const capBadge = (label: string, status?: string) => {
    const s = (status ?? "unknown").toLowerCase();
    const tone =
      s === "ready"
        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
        : s === "unknown"
        ? "bg-amber-100 text-amber-700 border-amber-300"
        : "bg-slate-100 text-slate-700 border-slate-300";
    const dot =
      s === "ready"
        ? "bg-emerald-500"
        : s === "unknown"
        ? "bg-amber-500"
        : "bg-slate-400";
    return (
      <span
        className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border ${tone}`}
      >
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        {label}: {s}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Capabilities</CardTitle>
              <CardDescription>
                Your connected wallet’s support on Base Sepolia (testnet)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {capBadge("Atomic batch", caps.atomic)}
              {capBadge("Sponsored gas", caps.sponsored)}
            </CardContent>
          </Card>

          {/* Asset Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Asset</CardTitle>
              <CardDescription>
                Choose the cryptocurrency to split
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAsset}
                onValueChange={(value: "ETH" | "USDC") =>
                  setSelectedAsset(value)
                }
              >
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ETH" id="ETH" />
                    <Label htmlFor="ETH" className="font-medium">
                      ETH
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="USDC" id="USDC" />
                    <Label htmlFor="USDC" className="font-medium">
                      USDC
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Recipients Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recipients</CardTitle>
                  <CardDescription>
                    Add 2–3 recipients for the split payment
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {recipients.length} of 3
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipients.map((recipient, index) => (
                <Card key={recipient.id} className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">
                        Recipient {index + 1}
                      </Label>
                      {/*Show the cross button only if > 2 recipients */}
                      {recipients.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove recipient ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label
                          htmlFor={`address-${recipient.id}`}
                          className="text-xs text-muted-foreground mb-2"
                        >
                          Wallet Address
                        </Label>
                        <Input
                          id={`address-${recipient.id}`}
                          type="text"
                          placeholder="0x..."
                          value={recipient.address}
                          onChange={(e) =>
                            updateRecipient(
                              recipient.id,
                              "address",
                              e.target.value
                            )
                          }
                          className={`font-mono text-sm ${
                            rowErrors[index].invalidAddress
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {rowErrors[index].invalidAddress && (
                          <p className="mt-1 text-xs text-red-600">
                            Enter a valid EVM address (0x…)
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor={`amount-${recipient.id}`}
                          className="text-xs text-muted-foreground mb-2"
                        >
                          Amount ({selectedAsset})
                        </Label>
                        <Input
                          id={`amount-${recipient.id}`}
                          type="number"
                          step="0.000001"
                          min="0"
                          placeholder="0.0"
                          value={recipient.amount}
                          onChange={(e) =>
                            updateRecipient(
                              recipient.id,
                              "amount",
                              e.target.value
                            )
                          }
                          className={`${
                            rowErrors[index].invalidAmount
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {rowErrors[index].invalidAmount && (
                          <p className="mt-1 text-xs text-red-600">
                            Enter a positive number
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {recipients.length < 3 && (
                <Button
                  variant="outline"
                  onClick={addRecipient}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipient
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Summary & Pay Button */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Summary</CardTitle>
                  <CardDescription>
                    Review and confirm your batch payment
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {totalAmount} {selectedAsset}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactionStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Transaction completed successfully! All recipients have been
                    paid.
                  </AlertDescription>
                </Alert>
              )}

              {transactionStatus === "error" && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>
                    Transaction failed. Please check your wallet and try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePayOnce}
                disabled={!canSubmit}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Batch Transaction…
                  </>
                ) : (
                  <>
                    Pay Once
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This creates a single batch transaction to all recipients using
                ERC-4337 / EIP-5792. Your wallet may send atomically (if
                supported) or sequentially via fallback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
