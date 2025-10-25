"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { MARKETPLACE_ABI } from "@/contracts/marketplace-abi";
import { ERC721_ABI } from "@/contracts/erc721-abi";

const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0xac0e62c14aad79e8bbea594989a230b7404fdf48" as `0x${string}`);

interface UseListNftAtOraclePriceParams {
  nftContract: string;
  tokenId: string | number;
}

export function useContractListNftAtOraclePrice() {
  const queryClient = useQueryClient();
  const { writeContract, isPending: isWritePending, data: txHash } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [localError, setLocalError] = useState<Error | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [step, setStep] = useState<"idle" | "approving" | "listing">("idle");

  const listNFTAtOraclePrice = useCallback(
    (params: UseListNftAtOraclePriceParams) => {
      const { nftContract, tokenId } = params;
      setLocalError(null);
      setError(null);
      setStep("approving");

      // First, approve the marketplace contract to transfer the NFT
      writeContract(
        {
          address: nftContract as `0x${string}`,
          abi: ERC721_ABI,
          functionName: "approve",
          args: [MARKETPLACE_CONTRACT_ADDRESS, BigInt(tokenId)],
        },
        {
          onSuccess: () => {
            // After approval succeeds, list the NFT
            setStep("listing");
            setTimeout(() => {
              writeContract(
                {
                  address: MARKETPLACE_CONTRACT_ADDRESS,
                  abi: MARKETPLACE_ABI,
                  functionName: "listNFTAtOraclePrice",
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
                    setStep("idle");
                  },
                }
              );
            }, 1000);
          },
          onError: (err) => {
            setError(err);
            setStep("idle");
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
    setStep("idle");
  }, []);

  return {
    listNFTAtOraclePrice,
    isPending,
    isSuccess,
    isError,
    error: error || localError,
    txHash,
    reset,
    step,
  };
}
