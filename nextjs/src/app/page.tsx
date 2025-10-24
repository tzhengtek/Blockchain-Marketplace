"use client";

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Blockchain
        </h1>
        <p className="text-lg text-muted-foreground">
          A decentralized platform for token management and swaps
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-2">Swap</h2>
            <p className="text-muted-foreground">
              Exchange tokens seamlessly across multiple blockchain networks
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-2">KYC</h2>
            <p className="text-muted-foreground">
              Complete your know-your-customer verification to unlock full
              platform features
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-2">Wallet</h2>
            <p className="text-muted-foreground">
              Connect your Web3 wallet using Reown AppKit for secure
              transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
