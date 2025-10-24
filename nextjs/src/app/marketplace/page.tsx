"use client";

import React, { JSX } from "react";
import { useListedNft } from "@/hooks/use-listed-nft";
import { MarketplaceNftCard } from "@/components/molecules/marketplace-nft-card";
import { MarketplaceSkeleton } from "@/components/skeletons/marketplace-skeleton";
import { OwnedNftsSection } from "@/components/molecules/owned-nfts-section";

export default function Marketplace(): JSX.Element {
  const { data: listedNfts, isLoading, isError } = useListedNft();

  if (isLoading) return <MarketplaceSkeleton />;
  if (isError)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#111122] to-[#0b0b0f] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading marketplace</p>
          <p className="text-gray-400 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#111122] to-[#0b0b0f] text-white p-8">
        {/* Listed NFTs Section */}
        <div className="mb-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">NFT Marketplace</h1>
            <p className="text-gray-400">
              {listedNfts?.length || 0} NFTs available for purchase
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <MarketplaceSkeleton />
          ) : isError ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-red-500 text-center">
                <p className="text-xl font-semibold">Error loading marketplace</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page</p>
              </div>
            </div>
          ) : listedNfts && listedNfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listedNfts.map((nft) => (
                <MarketplaceNftCard
                  key={`${nft.nft_contract}-${nft.token_id}`}
                  nft={nft}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-xl text-gray-400">No NFTs available</p>
              </div>
            </div>
          )}
        </div>

        {/* Owned NFTs Section */}
        <div className="border-t border-white/10 pt-16">
          <OwnedNftsSection />
        </div>
      </div>
    </>
  );
}
