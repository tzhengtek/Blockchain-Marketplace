import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, sepolia, bscTestnet } from "wagmi/chains";

export const projectId = "ba29e79c8f9279833c62bd1a8b15a7d0";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [mainnet, arbitrum, sepolia, bscTestnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  chains: [mainnet, arbitrum, sepolia, bscTestnet],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"), // ✅ endpoint RPC testnet officiel
  },
});

// wagmi config prêt à être exporté
export const config = wagmiAdapter.wagmiConfig;
