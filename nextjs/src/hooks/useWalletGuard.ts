import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useEffect } from "react";

export const useWalletGuard = () => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  useEffect(() => {
    if (!isConnected) {
      open?.();
    }
  }, [isConnected, open]);

  return {
    isConnected,
    address,
  };
};
