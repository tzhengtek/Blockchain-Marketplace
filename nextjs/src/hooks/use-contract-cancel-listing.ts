"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { MARKETPLACE_ABI } from "@/contracts/marketplace-abi";

const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0xac0e62c14aad79e8bbea594989a230b7404fdf48" as `0x${string}`);

interface UseCancelListingParams {
  nftContract: string;
  tokenId: string | number;
}

export function useContractCancelListing() {
  const queryClient = useQueryClient();
  const { writeContract, isPending: isWritePending, data: txHash } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [localError, setLocalError] = useState<Error | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const cancelListing = useCallback(
    (params: UseCancelListingParams) => {
      const { nftContract, tokenId } = params;
      setLocalError(null);
      setError(null);

      writeContract(
        {
          address: MARKETPLACE_CONTRACT_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: "cancelListing",
          args: [nftContract as `0x${string}`, BigInt(tokenId)],
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
    cancelListing,
    isPending,
    isSuccess,
    isError,
    error: error || localError,
    txHash,
    reset,
  };
}
