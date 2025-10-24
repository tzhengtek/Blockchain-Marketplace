"use client";

import { Button } from "@/components/atoms/button";
import { Nft } from "@/types/nft";
import { getBscScanAddressUrl } from "@/utils/bscscan";
import { getNftImageByTokenId } from "@/utils/nft-images";
import { useMemo } from "react";

interface OwnedNftCardProps {
  nft: Nft;
  onSell?: (nft: Nft) => void;
}

export function OwnedNftCard({ nft, onSell }: OwnedNftCardProps) {
  // Get image URL based on token ID (deterministic)
  const imageUrl = useMemo(
    () => getNftImageByTokenId(Number(nft.token_id)),
    [nft.token_id]
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-[#2f3b8f] to-[#1a1f4d] flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={`NFT #${nft.token_id}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Container */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <div>
          <h3 className="text-sm font-semibold text-white">
            NFT #{nft.token_id}
          </h3>
        </div>

        {/* Contract Address */}
        <div>
          <p className="text-xs text-gray-500">Contract</p>
          <a
            href={getBscScanAddressUrl(nft.contract_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 truncate block"
            title={nft.contract_address}
          >
            {nft.contract_address.slice(0, 8)}...
            {nft.contract_address.slice(-6)}
          </a>
        </div>

        {/* Owner Address */}
        <div>
          <p className="text-xs text-gray-500">Owner</p>
          <a
            href={getBscScanAddressUrl(nft.owner)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 truncate block"
            title={nft.owner}
          >
            {nft.owner.slice(0, 8)}...{nft.owner.slice(-6)}
          </a>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-white/10">
          <Button
            onClick={() => onSell?.(nft)}
            className="w-full  text-white font-semibold py-1.5 text-sm rounded-lg transition-colors"
          >
            Sell
          </Button>
        </div>
      </div>
    </div>
  );
}
