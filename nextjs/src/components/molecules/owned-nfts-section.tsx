"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useNft } from "@/hooks/use-nft";
import { OwnedNftCard } from "./owned-nft-card";
import { OwnedNftSkeleton } from "@/components/skeletons/owned-nft-skeleton";
import { SellConfirmationDialog } from "./sell-confirmation-dialog";
import { Nft } from "@/types/nft";

export function OwnedNftsSection() {
  const { address } = useAccount();
  const { data: ownedNfts, isLoading, isError } = useNft({
    owner: address,
    page: 1,
  });
  const queryClient = useQueryClient();

  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const nfts = ownedNfts?.nfts ?? [];

  const handleSellClick = (nft: Nft) => {
    setSelectedNft(nft);
    setDialogOpen(true);
  };

  const handleListingSuccess = (nft: Nft) => {
    // Invalidate queries to refresh the owned NFTs
    queryClient.invalidateQueries({ queryKey: ["nft"] });
    queryClient.invalidateQueries({ queryKey: ["listed-nfts"] });
  };

  if (!address) {
    return (
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-6">
        <p className="text-yellow-300 text-center font-semibold">
          💼 Connect your wallet to view your NFTs
        </p>
      </div>
    );
  }

  if (isLoading) return <OwnedNftSkeleton />;

  if (isError)
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300 text-center">Error loading your NFTs</p>
      </div>
    );

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Your NFTs</h2>
          <p className="text-gray-400 text-sm mt-1">
            {nfts.length} NFT{nfts.length !== 1 ? "s" : ""} in your wallet
          </p>
        </div>

        {/* Grid */}
        {nfts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <OwnedNftCard
                key={`${nft.contract_address}-${nft.token_id}`}
                nft={nft}
                onSell={handleSellClick}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-gray-400">You don't have any NFTs yet</p>
          </div>
        )}
      </div>

      {/* Sell Confirmation Dialog */}
      <SellConfirmationDialog
        nft={selectedNft}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleListingSuccess}
      />
    </>
  );
}
