"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { ListedNft } from "@/types/listed-nft";
import { Button } from "@/components/atoms/button";
import { getBscScanAddressUrl } from "@/utils/bscscan";
import { getNftImageByTokenId } from "@/utils/nft-images";
import { BuyConfirmationDialog } from "./buy-confirmation-dialog";
import { CancelListingDialog } from "./cancel-listing-dialog";

const COMPANY_ADDRESS = "0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c".toLowerCase();

interface MarketplaceNftCardProps {
  nft: ListedNft;
}

export function MarketplaceNftCard({ nft }: MarketplaceNftCardProps) {
  const { address } = useAccount();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Convert price from Wei to BNB (1 BNB = 10^18 Wei)
  const priceInBnb = (Number(nft.price) / 1e18).toFixed(4);

  // Get image URL based on token ID (deterministic)
  const imageUrl = useMemo(() => getNftImageByTokenId(nft.token_id), [nft.token_id]);

  // Check if seller is the company
  const isCompanySeller = useMemo(() => nft.seller.toLowerCase() === COMPANY_ADDRESS, [nft.seller]);

  // Check if connected wallet is the seller
  const isConnectedSeller = useMemo(
    () => address && nft.seller.toLowerCase() === address.toLowerCase(),
    [address, nft.seller]
  );

  const handleBuyClick = () => {
    setBuyDialogOpen(true);
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleSuccess = () => {
    // Invalidate queries to refresh the marketplace
    queryClient.invalidateQueries({ queryKey: ["listed-nfts"] });
    queryClient.invalidateQueries({ queryKey: ["nft"] });
  };

  return (
    <>
    <div className="group rounded-xl border border-primary/40 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-lg overflow-hidden hover:border-primary/70 hover:bg-gradient-to-br hover:from-card/80 hover:to-card/60 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-primary/20 via-secondary/20 to-cyan-600/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <img
          src={imageUrl}
          alt={`NFT #${nft.token_id}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">NFT #{nft.token_id}</h3>
        </div>

        {/* Contract Address */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Contract</p>
          <a
            href={getBscScanAddressUrl(nft.nft_contract)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-300 hover:text-cyan-200 truncate block transition-colors font-semibold"
            title={nft.nft_contract}
          >
            {nft.nft_contract.slice(0, 8)}...{nft.nft_contract.slice(-6)}
          </a>
        </div>

        {/* Seller Address / Company Badge */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Seller</p>
          {isCompanySeller ? (
            <a
              href={getBscScanAddressUrl(nft.seller)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 border border-primary/50 hover:border-primary/80 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/40 hover:to-secondary/40 hover:shadow-lg hover:shadow-primary/20 group/badge"
              title={`Company: ${nft.seller}`}
            >
              <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                ✨ Official
              </span>
              <span className="text-xs text-gray-300 group-hover/badge:text-white transition-colors">
                {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
              </span>
            </a>
          ) : (
            <a
              href={getBscScanAddressUrl(nft.seller)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-300 hover:text-cyan-200 truncate block transition-colors font-semibold"
              title={nft.seller}
            >
              {nft.seller.slice(0, 8)}...{nft.seller.slice(-6)}
            </a>
          )}
        </div>

        {/* Price and Action Button */}
        <div className="pt-3 border-t border-primary/20 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</p>
            <p className="text-xl font-bold text-white">
              {priceInBnb}
              <span className="text-xs text-muted-foreground ml-2">BNB</span>
            </p>
          </div>
          {isConnectedSeller ? (
            <Button
              onClick={handleCancelClick}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              Cancel Listing
            </Button>
          ) : (
            <Button
              onClick={handleBuyClick}
              disabled={isConnectedSeller}
              className="w-full"
              size="sm"
            >
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </div>

    {/* Buy Confirmation Dialog */}
    <BuyConfirmationDialog
      nft={nft}
      open={buyDialogOpen}
      onOpenChange={setBuyDialogOpen}
      onSuccess={handleSuccess}
    />

    {/* Cancel Listing Dialog */}
    <CancelListingDialog
      nft={nft}
      open={cancelDialogOpen}
      onOpenChange={setCancelDialogOpen}
      onSuccess={handleSuccess}
    />
    </>
  );
}
