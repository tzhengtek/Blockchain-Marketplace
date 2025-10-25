"use client";

import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { useContractListNft } from "@/hooks/use-contract-list-nft";
import { useContractListNftAtOraclePrice } from "@/hooks/use-contract-list-nft-at-oracle-price";
import { useCheckNftApproval } from "@/hooks/use-check-nft-approval";
import { useContractApproveNft } from "@/hooks/use-contract-approve-nft";
import { ORACLE_ABI } from "@/contracts/oracle-abi";
import { Nft } from "@/types/nft";
import { getBscScanAddressUrl } from "@/utils/bscscan";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useReadContract } from "wagmi";
import { Loader2 } from "lucide-react";

const BSCSCAN_TX_URL =
  process.env.NEXT_PUBLIC_BSCSCAN_URL || "https://testnet.bscscan.com";
const ORACLE_ADDRESS =
  (process.env.NEXT_PUBLIC_ORACLE_ADDRESS as `0x${string}`) ||
  ("0xf39472BCBECcACB22256424F96Ef0151a0b5c8d5" as `0x${string}`);

interface SellConfirmationDialogProps {
  nft: Nft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (nft: Nft) => void;
}

export function SellConfirmationDialog({
  nft,
  open,
  onOpenChange,
  onSuccess,
}: SellConfirmationDialogProps) {
  if (!nft || !nft.token_id) return null;

  const [price, setPrice] = useState<string>("");
  const { listNFT, isPending, isSuccess, isError, error, txHash, reset, step } =
    useContractListNft();
  const {
    listNFTAtOraclePrice,
    isPending: isOraclePending,
    isSuccess: isOracleSuccess,
    isError: isOracleError,
    error: oracleError,
    txHash: oracleTxHash,
    reset: oracleReset,
    step: oracleStep,
  } = useContractListNftAtOraclePrice();
  const {
    approveNFT,
    isPending: isApprovePending,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    error: approveError,
    txHash: approveTxHash,
    reset: approveReset,
  } = useContractApproveNft();
  const { isApproved, isLoading: isCheckingApproval } = useCheckNftApproval({
    nftContract: nft.contract_address,
    tokenId: nft.token_id!,
  });
  const toastIdRef = useRef<string | number | null>(null);

  // Fetch oracle price
  const { data: oraclePriceData } = useReadContract({
    address: ORACLE_ADDRESS,
    abi: ORACLE_ABI,
    functionName: "getLatestPrice",
    args: [nft.contract_address as `0x${string}`, BigInt(nft.token_id!)],
  });

  const oraclePriceInWei = (oraclePriceData as any)?.[0]?.toString() || "0";
  const oraclePriceInBnb = (Number(oraclePriceInWei) / 1e18).toFixed(4);
  const oraclePriceInUsd = (parseFloat(oraclePriceInBnb) * 600).toFixed(2);

  // Convert BNB to Wei (1 BNB = 10^18 Wei)
  const priceInWei = price ? (parseFloat(price) * 1e18).toString() : "0";
  const usdPrice = price ? (parseFloat(price) * 600).toFixed(2) : "0.00";

  // Show loading toast when transaction starts
  useEffect(() => {
    if (isPending || isOraclePending) {
      const message = (step === "approving" || oracleStep === "approving")
        ? "Approving marketplace..."
        : "Listing NFT...";
      const description = (step === "approving" || oracleStep === "approving")
        ? "Sign to approve the marketplace to transfer your NFT."
        : "Please sign and wait for confirmation.";
      toastIdRef.current = toast.loading(message, {
        description,
      });
    }
  }, [isPending, isOraclePending, step, oracleStep]);

  // Show loading toast for standalone approval
  useEffect(() => {
    if (isApprovePending) {
      toastIdRef.current = toast.loading("Approving NFT...", {
        description: "Sign to approve the marketplace to transfer your NFT.",
      });
    }
  }, [isApprovePending]);

  // Show success toast on success (custom price)
  useEffect(() => {
    if (isSuccess && nft && step === "listing") {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const truncatedHash = txHash
        ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}`
        : "Transaction sent";
      toast.success("NFT listed successfully!", {
        description: `NFT #${nft.token_id} • TxID: ${truncatedHash}`,
        action: txHash
          ? {
              label: "View on BSCScan",
              onClick: () =>
                window.open(`${BSCSCAN_TX_URL}/tx/${txHash}`, "_blank"),
            }
          : undefined,
      });
      setPrice("");
      reset?.();
      onSuccess?.(nft);
      onOpenChange(false);
    }
  }, [isSuccess, nft, txHash, onSuccess, onOpenChange, step, reset]);

  // Show success toast on oracle price listing success
  useEffect(() => {
    if (isOracleSuccess && nft && oracleStep === "listing") {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const truncatedHash = oracleTxHash
        ? `${oracleTxHash.slice(0, 8)}...${oracleTxHash.slice(-6)}`
        : "Transaction sent";
      toast.success("NFT listed at oracle price!", {
        description: `NFT #${nft.token_id} @ ${oraclePriceInBnb} BNB • TxID: ${truncatedHash}`,
        action: oracleTxHash
          ? {
              label: "View on BSCScan",
              onClick: () =>
                window.open(`${BSCSCAN_TX_URL}/tx/${oracleTxHash}`, "_blank"),
            }
          : undefined,
      });
      setPrice("");
      oracleReset?.();
      onSuccess?.(nft);
      onOpenChange(false);
    }
  }, [
    isOracleSuccess,
    nft,
    oracleTxHash,
    oraclePriceInBnb,
    onSuccess,
    onOpenChange,
    oracleStep,
    oracleReset,
  ]);

  // Show approval success toast
  useEffect(() => {
    if (isApproveSuccess) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const truncatedHash = approveTxHash
        ? `${approveTxHash.slice(0, 8)}...${approveTxHash.slice(-6)}`
        : "Transaction sent";
      toast.success("NFT approved for marketplace!", {
        description: `TxID: ${truncatedHash}`,
        action: approveTxHash
          ? {
              label: "View on BSCScan",
              onClick: () =>
                window.open(`${BSCSCAN_TX_URL}/tx/${approveTxHash}`, "_blank"),
            }
          : undefined,
      });
      approveReset?.();
    }
  }, [isApproveSuccess, approveTxHash, approveReset]);

  // Show error toast on error
  useEffect(() => {
    if (isError && error) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error("Listing failed", {
        description: error.message || "Please try again.",
      });
    }
  }, [isError, error]);

  // Show approval error toast
  useEffect(() => {
    if (isApproveError && approveError) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error("Approval failed", {
        description: approveError.message || "Please try again.",
      });
    }
  }, [isApproveError, approveError]);

  // Show error toast on oracle error
  useEffect(() => {
    if (isOracleError && oracleError) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error("Oracle listing failed", {
        description: oracleError.message || "Please try again.",
      });
    }
  }, [isOracleError, oracleError]);

  // Reset transaction state when dialog closes
  useEffect(() => {
    if (!open) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      setPrice("");
      reset?.();
      oracleReset?.();
      approveReset?.();
    }
  }, [open, reset, oracleReset, approveReset]);

  const handleConfirm = () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error("Invalid price", {
        description: "Please enter a valid price greater than 0",
      });
      return;
    }

    listNFT({
      nftContract: nft.contract_address,
      tokenId: nft.token_id!,
      price: priceInWei,
    });
  };

  const handleListAtOraclePrice = () => {
    listNFTAtOraclePrice({
      nftContract: nft.contract_address,
      tokenId: nft.token_id!,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPrice("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>
            Set your asking price for this NFT
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
                  href={getBscScanAddressUrl(nft.contract_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 truncate max-w-[200px] transition-colors font-semibold"
                  title={nft.contract_address}
                >
                  {nft.contract_address.slice(0, 8)}...
                  {nft.contract_address.slice(-6)}
                </a>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">
                Asking Price (BNB)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.0000"
                disabled={isPending || isOraclePending}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-input/70 to-input/50 border-2 border-primary/50 text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition-all font-semibold"
              />
            </div>

            {/* Price Preview */}
            {price && (
              <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 p-4 border border-green-500/40">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price in Wei</span>
                    <span className="text-green-300 font-mono text-xs">
                      {priceInWei}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USD Equivalent</span>
                    <span className="text-green-300">≈ ${usdPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Oracle Price Section */}
            {oraclePriceInBnb && oraclePriceInBnb !== "0.0000" && (
              <div className="rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 p-4 border border-primary/40">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Oracle Price
                    </span>
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                      {oraclePriceInBnb}
                      <span className="text-xs text-muted-foreground ml-1">BNB</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      USD Equivalent
                    </span>
                    <span className="text-xs text-cyan-300">
                      ≈ ${oraclePriceInUsd}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {isError && error && (
            <div className="rounded-lg bg-red-500/20 p-3 border border-red-500/40">
              <p className="text-xs text-red-300">
                ❌ Listing failed: {error.message || "Unknown error"}
              </p>
            </div>
          )}


          {/* Warning */}
          <div className="rounded-lg bg-yellow-500/20 p-3 border border-yellow-500/40">
            <p className="text-xs text-yellow-300">
              ⚠️ You will be prompted to sign two transactions: first to approve
              the marketplace, then to list your NFT.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isPending || isOraclePending || isApprovePending}
            >
              Cancel
            </Button>
          </DialogClose>

          {!isApproved && !isCheckingApproval && (
            <Button
              onClick={() =>
                approveNFT({
                  nftContract: nft.contract_address,
                  tokenId: nft.token_id!,
                })
              }
              disabled={isApprovePending}
            >
              {isApprovePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve NFT"
              )}
            </Button>
          )}

          {isApproved && (
            <>
              <Button
                onClick={handleListAtOraclePrice}
                disabled={isPending || isOraclePending}
                variant="secondary"
              >
                {isOraclePending ? (
                  <>
                    ⏳{" "}
                    {oracleStep === "approving"
                      ? "Approving..."
                      : oracleStep === "listing"
                      ? "Listing..."
                      : "Confirming..."}
                  </>
                ) : (
                  "List at Oracle Price"
                )}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={
                  isPending || isOraclePending || !price || parseFloat(price) <= 0
                }
              >
                {isPending ? (
                  <>
                    ⏳{" "}
                    {step === "approving"
                      ? "Approving..."
                      : step === "listing"
                      ? "Listing..."
                      : "Confirming..."}
                  </>
                ) : (
                  "List for Sale"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
