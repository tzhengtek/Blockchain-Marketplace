"use client";

import { Card, CardDescription, CardTitle } from "@/components/atoms/card";
import { useWalletGuard } from "@/hooks/useWalletGuard";

export default function Home() {
  useWalletGuard();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-accent-foreground">
          Welcome to Blockchain
        </h1>
        <p className="text-lg text-muted-foreground">
          A decentralized platform for token management and swaps
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card href="/swap">
            <CardTitle>Swap</CardTitle>
            <CardDescription>
              Exchange tokens seamlessly across multiple blockchain networks
            </CardDescription>
          </Card>

          <Card href="/kyc">
            <CardTitle>KYC</CardTitle>
            <CardDescription>
              Complete your know-your-customer verification to unlock full
              platform features
            </CardDescription>
          </Card>

          <Card href="/transaction">
            <CardTitle>Wallet</CardTitle>
            <CardDescription>
              Connect your Web3 wallet using Reown AppKit for secure
              transactions
            </CardDescription>
          </Card>
        </div>
      </div>
    </div>
  );
}
