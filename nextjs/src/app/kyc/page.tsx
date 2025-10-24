"use client";

import { useAccount } from "wagmi";
import KYCComponent from "@/components/atoms/kyc-component";

export default function KYCPage() {
  const { address } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#111122] to-[#0b0b0f] text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">KYC Page</h1>
          <p className="text-sm text-gray-400 mt-2">
            Wallet:&nbsp;
            {address ? (
              <span className="font-mono text-gray-300">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            ) : (
              "Not connected"
            )}
          </p>
        </header>

        {/* Content */}
        {address ? (
          <div className="mt-2">
            <KYCComponent address={address} />
          </div>
        ) : (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 text-sm p-4">
            Connect your wallet to check your KYC status.
          </div>
        )}
      </div>
    </main>
  );
}
