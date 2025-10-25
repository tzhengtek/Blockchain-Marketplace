"use client";

import { useReadContract } from "wagmi";
import { ERC721_ABI } from "@/contracts/erc721-abi";

const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0xac0e62c14aad79e8bbea594989a230b7404fdf48" as `0x${string}`);

interface UseCheckNftApprovalParams {
  nftContract: string;
  tokenId: string | number;
}

export function useCheckNftApproval({
  nftContract,
  tokenId,
}: UseCheckNftApprovalParams) {
  const { data: approvedAddress, isLoading } = useReadContract({
    address: nftContract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: "getApproved",
    args: [BigInt(tokenId)],
  });

  const isApproved =
    approvedAddress?.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase();

  return {
    isApproved,
    isLoading,
    approvedAddress,
  };
}
