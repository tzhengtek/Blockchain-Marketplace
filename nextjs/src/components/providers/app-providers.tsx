"use client";

import { projectId, wagmiAdapter } from "@/utils/wagmi/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, bscTestnet, mainnet, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { type PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { Config, cookieToInitialState, WagmiProvider } from "wagmi";
import { ThemeProvider } from "../atoms/theme-provider";
import { ClientProviders } from "./client-providers";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "online",
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        if (error && (error as Error & { status?: number }).status) {
          const status = (error as Error & { status?: number }).status;
          if (status && (status === 401 || status === 403)) {
            return false;
          }
          if (status && status >= 500) {
            return failureCount < 3;
          }
        }
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) =>
        Math.min(1000 * Math.pow(2, attemptIndex), 30000),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});

const metadata = {
  name: "Blockchain Dashboard",
  description: "Tierzeta Blockchain Dashboard",
  url: "https://blockchain.tierzeta.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, sepolia, bscTestnet],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    analytics: true,
  },
});

export const AppProviders = ({
  children,
  cookies,
}: PropsWithChildren<{ cookies: string | null }>) => {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <ClientProviders>
            <Toaster position="top-right" closeButton richColors />
            {children}
          </ClientProviders>
        </QueryClientProvider>
      </ThemeProvider>
    </WagmiProvider>
  );
};
