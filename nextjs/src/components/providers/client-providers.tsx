"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";
import { wagmiAdapter } from "@/utils/wagmi/config";
import { Config, WagmiProvider } from "wagmi";

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <NuqsAdapter>
      <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
        {children}
      </WagmiProvider>
    </NuqsAdapter>
  );
}
