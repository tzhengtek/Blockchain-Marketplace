"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ListedNft } from "@/types/listed-nft";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { getBscScanAddressUrl } from "@/utils/bscscan";
import { useContractBuyNft } from "@/hooks/use-contract-buy-nft";

const BSCSCAN_TX_URL = process.env.NEXT_PUBLIC_BSCSCAN_URL || "https://testnet.bscscan.com";

interface BuyConfirmationDialogProps {
  nft: ListedNft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (nft: ListedNft) => void;
}

export function BuyConfirmationDialog({
  nft,
  open,
  onOpenChange,
  onSuccess,
}: BuyConfirmationDialogProps) {
  if (!nft) return null;

  const { buyNFT, isPending, isSuccess, isError, error, txHash, reset } = useContractBuyNft();
  const toastIdRef = useRef<string | number | null>(null);

  // Show loading toast when transaction starts
  useEffect(() => {
    if (isPending) {
      toastIdRef.current = toast.loading("Processing transaction...", {
        description: "Please sign and wait for confirmation.",
      });
    }
  }, [isPending]);

  // Show success toast on success
  useEffect(() => {
    if (isSuccess && nft) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const truncatedHash = txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : "Transaction sent";
      toast.success("NFT purchased successfully!", {
        description: `NFT #${nft.token_id} • TxID: ${truncatedHash}`,
        action: txHash ? {
          label: "View on BSCScan",
          onClick: () => window.open(`${BSCSCAN_TX_URL}/tx/${txHash}`, "_blank"),
        } : undefined,
      });
      onSuccess?.(nft);
      onOpenChange(false);
    }
  }, [isSuccess, nft, txHash, onSuccess, onOpenChange]);

  // Show error toast on error
  useEffect(() => {
    if (isError && error) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error("Transaction failed", {
        description: error.message || "Please try again.",
      });
    }
  }, [isError, error]);

  // Reset transaction state when dialog closes
  useEffect(() => {
    if (!open) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      reset?.();
    }
  }, [open, reset]);

  const priceInBnb = (Number(nft.price) / 1e18).toFixed(4);

  const handleConfirm = () => {
    buyNFT({
      nftContract: nft.nft_contract,
      tokenId: nft.token_id,
      price: nft.price.toString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Review the transaction details before confirming
          </DialogDescription>
        </DialogHeader>

        {/* NFT Details */}
        <div className="space-y-4 py-4">
          {/* NFT Info */}
          <div className="rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 p-4 border border-secondary/30">
            <h3 className="text-foreground font-bold mb-3 text-sm uppercase tracking-wider">NFT Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Token ID</span>
                <span className="text-foreground font-semibold">{nft.token_id}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground font-semibold">Contract</span>
                <a
                  href={getBscScanAddressUrl(nft.nft_contract)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 truncate max-w-[200px] transition-colors font-semibold"
                  title={nft.nft_contract}
                >
                  {nft.nft_contract.slice(0, 8)}...{nft.nft_contract.slice(-6)}
                </a>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground font-semibold">Seller</span>
                <a
                  href={getBscScanAddressUrl(nft.seller)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 truncate max-w-[200px] transition-colors font-semibold"
                  title={nft.seller}
                >
                  {nft.seller.slice(0, 8)}...{nft.seller.slice(-6)}
                </a>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 p-4 border border-primary/40">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase text-xs tracking-wider font-semibold">Total Price</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  {priceInBnb}
                  <span className="text-sm text-muted-foreground ml-2">BNB</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${(parseFloat(priceInBnb) * 600).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {isError && error && (
            <div className="rounded-lg bg-red-500/20 p-3 border border-red-500/40">
              <p className="text-xs text-red-300">
                ❌ Transaction failed: {error.message || "Unknown error"}
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-lg bg-yellow-500/20 p-3 border border-yellow-500/40">
            <p className="text-xs text-yellow-300">
              ⚠️ You will be prompted to sign the transaction with your connected wallet.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "⏳ Confirming..." : "Confirm & Sign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
