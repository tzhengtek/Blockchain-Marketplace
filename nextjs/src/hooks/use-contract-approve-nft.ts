"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC721_ABI } from "@/contracts/erc721-abi";

const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0xac0e62c14aad79e8bbea594989a230b7404fdf48" as `0x${string}`);

interface UseApproveNftParams {
  nftContract: string;
  tokenId: string | number;
}

export function useContractApproveNft() {
  const { writeContract, isPending: isWritePending, data: txHash } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [error, setError] = useState<Error | null>(null);

  const approveNFT = useCallback(
    (params: UseApproveNftParams) => {
      const { nftContract, tokenId } = params;
      setError(null);

      writeContract(
        {
          address: nftContract as `0x${string}`,
          abi: ERC721_ABI,
          functionName: "approve",
          args: [MARKETPLACE_CONTRACT_ADDRESS, BigInt(tokenId)],
        },
        {
          onError: (err) => {
            setError(err);
          },
        }
      );
    },
    [writeContract]
  );

  const isPending = isWritePending || isConfirming;
  const isError = !!error;

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    approveNFT,
    isPending,
    isSuccess,
    isError,
    error,
    txHash,
    reset,
  };
}
