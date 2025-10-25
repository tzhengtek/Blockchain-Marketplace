"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { MARKETPLACE_ABI } from "@/contracts/marketplace-abi";

const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0xac0e62c14aad79e8bbea594989a230b7404fdf48" as `0x${string}`);

interface UseBuyNftParams {
  nftContract: string;
  tokenId: string | number;
  price: string; // Price in Wei as string (for precision)
}

export function useContractBuyNft() {
  const queryClient = useQueryClient();
  const { writeContract, isPending: isWritePending, data: txHash } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [localError, setLocalError] = useState<Error | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const buyNFT = useCallback(
    (params: UseBuyNftParams) => {
      const { nftContract, tokenId, price } = params;
      setLocalError(null);
      setError(null);

      writeContract(
        {
          address: MARKETPLACE_CONTRACT_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: "buyNFT",
          args: [nftContract as `0x${string}`, BigInt(tokenId)],
          value: BigInt(price),
        },
        {
          onSuccess: () => {
            // Invalidate NFT queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["nft"] });
            queryClient.invalidateQueries({ queryKey: ["listed-nft"] });
          },
          onError: (err) => {
            setError(err);
          },
        }
      );
    },
    [writeContract, queryClient]
  );

  const isPending = isWritePending || isConfirming;
  const isError = !!error || !!localError;

  const reset = useCallback(() => {
    setLocalError(null);
    setError(null);
  }, []);

  return {
    buyNFT,
    isPending,
    isSuccess,
    isError,
    error: error || localError,
    txHash,
    reset,
  };
}
