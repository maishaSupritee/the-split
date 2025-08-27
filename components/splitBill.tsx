"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Wallet,
  Users,
  ArrowRight,
  Check,
  Loader2,
  LogOut,
} from "lucide-react";
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
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Header from "./header";

interface Recipient {
  id: string;
  address: string;
  amount: string;
}

export default function SplitBill() {
  const { setShowAuthFlow, handleLogOut } = useDynamicContext(); // Show auth flow if not connected
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

  // total amount calculation
  useEffect(() => {
    const total = recipients.reduce((sum, r) => {
      const amount = parseFloat(r.amount) || 0;
      return sum + amount;
    }, 0);
    setTotalAmount(total.toFixed(6));
  }, [recipients]);

  const addRecipient = () => {
    if (recipients.length < 3) {
      setRecipients([
        ...recipients,
        { id: Date.now().toString(), address: "", amount: "" },
      ]);
    }
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 2) {
      setRecipients(recipients.filter((r) => r.id !== id)); // if id matches recipient id, remove that recipient
    }
  };

  const updateRecipient = (
    id: string,
    field: "address" | "amount",
    value: string
  ) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const isFormValid = () => {
    // only valid if all recipients have an address and a positive amount
    return (
      recipients.every(
        (r) => r.address && r.amount && parseFloat(r.amount) > 0
      ) && parseFloat(totalAmount) > 0
    );
  };

  const handlePayOnce = async () => {
    if (!isFormValid()) return;

    setIsProcessing(true);
    setTransactionStatus("idle");

    try {
      // Simulate batch transaction processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // DO NEXT: implement the actual ERC-4337 batch transaction

      setTransactionStatus("success");
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
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
                    Add 2-3 recipients for the split payment
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
                          className="font-mono text-sm "
                        />
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
                          placeholder="0.0"
                          value={recipient.amount}
                          onChange={(e) =>
                            updateRecipient(
                              recipient.id,
                              "amount",
                              e.target.value
                            )
                          }
                        />
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
                disabled={!isFormValid() || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Batch Transaction...
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
                ERC-4337 smart wallet technology
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
