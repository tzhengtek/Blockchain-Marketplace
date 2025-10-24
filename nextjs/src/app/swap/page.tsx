"use client";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useContractWriter } from "@/utils/wagmi/useContractWriter";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  erc20Abi,
  encodeFunctionData,
  formatUnits,
  getAddress,
  parseUnits,
  zeroAddress,
} from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";

/* -------------------- Addresses (BSC Testnet) -------------------- */
const WBNB = getAddress("0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd");
const ASSET = getAddress("0xcD15905A28927C9001E532c43CD977a49Cae655D");
const PAIR_ASSET_WBNB = getAddress(
  "0xcC2CbDb6AC80A2BDE4c0cB2F7B7743d28E7e710A"
);
const MULTICALL_ADDRESS = getAddress(
  "0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042"
);

/* -------------------- ABIs -------------------- */
const multicallAbi = [
  {
    type: "function",
    name: "aggregate3",
    stateMutability: "payable",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" },
        ],
      },
    ],
    outputs: [
      {
        name: "returnData",
        type: "tuple[]",
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" },
        ],
      },
    ],
  },
] as const;
const pairAbi = [
  {
    type: "function",
    name: "getReserves",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint112" }, { type: "uint112" }, { type: "uint32" }],
  },
  {
    type: "function",
    name: "token0",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "token1",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "swap",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount0Out", type: "uint256" },
      { name: "amount1Out", type: "uint256" },
      { name: "to", type: "address" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

const wbnbAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "wad", type: "uint256" }],
    outputs: [],
  },
] as const;

/* -------------------- Simple token model -------------------- */
type TokenInfo = {
  symbol: string;
  name: string;
  address: `0x${string}` | null; // null = native (tBNB)
  decimals: number;
  native?: boolean;
};

const TOKENS: readonly TokenInfo[] = [
  {
    symbol: "tBNB",
    name: "Testnet BNB",
    address: null,
    decimals: 18,
    native: true,
  },
  { symbol: "WBNB", name: "Wrapped BNB", address: WBNB, decimals: 18 },
  { symbol: "RVP", name: "RealVault Protocol", address: ASSET, decimals: 18 },
];

/* -------------------- AMM math (direct pair) -------------------- */
/** Fee 0.25% like Pancake v2. */
const FEE_NUM = BigInt(9975);
const FEE_DEN = BigInt(10000);

function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
  if (
    amountIn <= BigInt(0) ||
    reserveIn <= BigInt(0) ||
    reserveOut <= BigInt(0)
  )
    return BigInt(0);
  const amountInWithFee = amountIn * FEE_NUM;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * FEE_DEN + amountInWithFee;
  return denominator === BigInt(0) ? BigInt(0) : numerator / denominator;
}

/* -------------------- Helpers -------------------- */
const isWrap = (from: TokenInfo, to: TokenInfo) =>
  from.native && !to.native && getAddress(to.address!) === WBNB;
const isUnwrap = (from: TokenInfo, to: TokenInfo) =>
  !from.native && getAddress(from.address!) === WBNB && to.native;
const isFromRvp = (from: TokenInfo) =>
  !from.native && getAddress(from.address!) === ASSET;
const isToRvp = (to: TokenInfo) =>
  !to.native && getAddress(to.address!) === ASSET;

/* -------------------- Page -------------------- */
export default function SwapPage() {
  const { address } = useAccount();
  const { call, txHash, isPending, isMining, isConfirmed } =
    useContractWriter();

  const [from, setFrom] = useState<TokenInfo>(TOKENS[0]); // tBNB
  const [to, setTo] = useState<TokenInfo>(TOKENS[2]); // RVP
  const [amountUi, setAmountUi] = useState("");
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%
  const [uiError, setUiError] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [transactionType, setTransactionType] = useState<"approval" | "swap" | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const clearError = () => setUiError("");

  /* ---- Balances ---- */
  const nativeBal = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });
  const { data: fromErc20Raw } = useReadContract({
    abi: erc20Abi,
    address: from.address ?? undefined,
    functionName: "balanceOf",
    args: [(address ?? zeroAddress) as `0x${string}`],
    query: { enabled: Boolean(address && from.address) },
  });
  const fromBalance = useMemo(() => {
    if (!address) return 0;
    if (from.native) {
      const v = nativeBal.data?.value ?? BigInt(0);
      return Number(formatUnits(v, 18));
    }
    const v = (fromErc20Raw as bigint | undefined) ?? BigInt(0);
    return Number(formatUnits(v, from.decimals));
  }, [
    address,
    from.native,
    nativeBal.data?.value,
    fromErc20Raw,
    from.decimals,
  ]);

  /* ---- Pair data ---- */
  const { data: t0 } = useReadContract({
    abi: pairAbi,
    address: PAIR_ASSET_WBNB,
    functionName: "token0",
  });
  const { data: t1 } = useReadContract({
    abi: pairAbi,
    address: PAIR_ASSET_WBNB,
    functionName: "token1",
  });
  const { data: reservesRaw } = useReadContract({
    abi: pairAbi,
    address: PAIR_ASSET_WBNB,
    functionName: "getReserves",
  });

  const pair = useMemo(() => {
    try {
      const token0 = t0 ? getAddress(t0 as string) : null;
      const token1 = t1 ? getAddress(t1 as string) : null;
      const r0 = reservesRaw ? ((reservesRaw as any)[0] as bigint) : BigInt(0);
      const r1 = reservesRaw ? ((reservesRaw as any)[1] as bigint) : BigInt(0);
      const isWbnbRvp =
        token0 &&
        token1 &&
        ((token0 === WBNB && token1 === ASSET) ||
          (token0 === ASSET && token1 === WBNB));
      return { token0, token1, r0, r1, isWbnbRvp };
    } catch {
      return null;
    }
  }, [t0, t1, reservesRaw]);

  /* ---- Check Allowance ---- */
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: from.address ?? undefined,
    functionName: "allowance",
    args:
      address && from.address
        ? [address as `0x${string}`, PAIR_ASSET_WBNB]
        : undefined,
    query: { enabled: Boolean(address && from.address && !from.native) },
  });

  useEffect(() => {
    if (!from.native && amountUi && allowanceRaw !== undefined) {
      const allowance = allowanceRaw as bigint;
      const amountInWei = parseUnits(amountUi, from.decimals);
      setNeedsApproval(allowance < amountInWei);
    } else {
      setNeedsApproval(false);
    }
  }, [from, amountUi, allowanceRaw]);

  /* ---- Wait for approval confirmation ---- */
  useEffect(() => {
    if (isApproved && isConfirmed) {
      setIsApproved(false);
    }
  }, [isConfirmed]);

  /* ---- Toast: Approval Pending ---- */
  useEffect(() => {
    if (isApproving) {
      toastIdRef.current = toast.loading("Approving token...", {
        description: "Sign the transaction to approve token spending.",
      });
    }
  }, [isApproving]);

  /* ---- Toast: Approval Success ---- */
  useEffect(() => {
    if (isApproved && isConfirmed && transactionType === "approval") {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const truncatedHash = txHash
        ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}`
        : "Transaction sent";
      toast.success("Token approved!", {
        description: `TxID: ${truncatedHash}`,
        action: txHash
          ? {
              label: "View on BSCScan",
              onClick: () =>
                window.open(
                  `https://testnet.bscscan.com/tx/${txHash}`,
                  "_blank"
                ),
            }
          : undefined,
      });
      setTransactionType(null);
      // Refetch allowance after approval
      refetchAllowance();
    }
  }, [isApproved, isConfirmed, txHash, transactionType, refetchAllowance]);

  /* ---- Toast: Swap Pending ---- */
  useEffect(() => {
    if (isPending && !isApproving) {
      toastIdRef.current = toast.loading("Processing swap...", {
        description: "Sign the transaction to complete the swap.",
      });
    }
  }, [isPending, isApproving]);

  /* ---- Toast: Mining/Confirmation ---- */
  useEffect(() => {
    if (isMining) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const isApprovalMining = transactionType === "approval";
      const message = isApprovalMining ? "Confirming approval..." : "Swapping...";
      const description = isApprovalMining
        ? "Waiting for approval confirmation."
        : "Waiting for transaction confirmation.";

      toastIdRef.current = toast.loading(message, {
        description,
      });
    }
  }, [isMining, transactionType]);

  /* ---- Toast: Swap Success ---- */
  useEffect(() => {
    if (isConfirmed && isMining === false && txHash && transactionType === "swap") {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      const truncatedHash = `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;
      toast.success("Swap completed!", {
        description: `TxID: ${truncatedHash}`,
        action: {
          label: "View on BSCScan",
          onClick: () =>
            window.open(`https://testnet.bscscan.com/tx/${txHash}`, "_blank"),
        },
      });
      setAmountUi("");
      setTransactionType(null);
    }
  }, [isConfirmed, isMining, txHash, transactionType]);

  /* ---- Toast: Error ---- */
  useEffect(() => {
    if (uiError) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error("Transaction failed", {
        description: uiError,
      });
    }
  }, [uiError]);

  /* ---- Quote (direct via reserves) ---- */
  const [estOut, setEstOut] = useState<string>("-");
  const [minOut, setMinOut] = useState<string>("-");
  const [rawOut, setRawOut] = useState<bigint | null>(null);
  const [routeMsg, setRouteMsg] = useState<string>("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setRouteMsg("");
        setEstOut("-");
        setMinOut("-");
        setRawOut(null);

        if (!amountUi || Number(amountUi) <= 0) return;
        if (!pair || !pair.isWbnbRvp) {
          setRouteMsg("Pair is not RVP/WBNB or reserves not loaded.");
          return;
        }

        // WRAP/UNWRAP: 1:1 quote
        if (isWrap(from, to) || isUnwrap(from, to)) {
          const amt = parseUnits(amountUi, 18);
          const min = (amt * BigInt(10_000 - slippageBps)) / BigInt(10_000);
          if (!cancel) {
            setRawOut(amt);
            setEstOut(formatUnits(amt, 18));
            setMinOut(formatUnits(min, 18));
          }
          return;
        }

        // Only allow swaps that involve the RVP/WBNB pair
        const isFromWbnb = !from.native && getAddress(from.address!) === WBNB;
        const isToWbnb = !to.native && getAddress(to.address!) === WBNB;
        const isFromRvp = !from.native && getAddress(from.address!) === ASSET;
        const isToRvp = !to.native && getAddress(to.address!) === ASSET;

        // tBNB<->RVP go through wrap/unwrap + pair — valid
        // WBNB<->RVP go directly — valid
        const valid =
          (isFromWbnb && isToRvp) ||
          (isFromRvp && isToWbnb) ||
          (from.native && isToRvp) ||
          (isFromRvp && to.native);

        if (!valid) {
          setRouteMsg(
            "Unsupported route (this file only handles RVP/WBNB pair)."
          );
          return;
        }

        // Prepare reserves based on token order
        const amountIn = parseUnits(amountUi, from.decimals);
        let reserveIn: bigint, reserveOut: bigint;

        // If we swap *to/from* ASSET using the pair, choose the correct side
        // Pair ordering: token0/token1 = (either WBNB/ASSET or ASSET/WBNB)
        const token0 = pair.token0!;
        const token1 = pair.token1!;
        const isToken0Wbnb = token0 === WBNB;

        // Case A: WBNB -> RVP (or tBNB->RVP after wrapping)
        if ((isFromWbnb && isToRvp) || (from.native && isToRvp)) {
          // input = WBNB; output = RVP
          reserveIn = isToken0Wbnb ? pair.r0 : pair.r1;
          reserveOut = isToken0Wbnb ? pair.r1 : pair.r0;
        }
        // Case B: RVP -> WBNB (or RVP->tBNB then unwrap)
        else {
          // input = RVP; output = WBNB
          reserveIn = isToken0Wbnb ? pair.r1 : pair.r0;
          reserveOut = isToken0Wbnb ? pair.r0 : pair.r1;
        }

        const out = getAmountOut(amountIn, reserveIn, reserveOut);
        if (out === BigInt(0)) {
          setRouteMsg("Insufficient liquidity or wrong fee assumption.");
          return;
        }

        const min = (out * BigInt(10_000 - slippageBps)) / BigInt(10_000);
        if (!cancel) {
          setRawOut(out);
          setEstOut(formatUnits(out, to.decimals));
          setMinOut(formatUnits(min, to.decimals));
        }
      } catch (e) {
        if (!cancel) setRouteMsg("Quote error.");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [amountUi, from, to, slippageBps, pair]);

  /* ---- Approve Token ---- */
  const approve = async () => {
    try {
      setUiError("");
      if (!address) throw new Error("Connect your wallet first.");
      if (!from.address) throw new Error("Cannot approve native token.");

      const amountIn = parseUnits(amountUi, from.decimals);
      setIsApproving(true);
      setTransactionType("approval");

      await call({
        abi: erc20Abi,
        address: from.address,
        functionName: "approve",
        args: [PAIR_ASSET_WBNB, amountIn],
      });

      setIsApproved(true);
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Approval failed.";
      setUiError(
        msg.replace(/0x[a-fA-F0-9]{20,}/g, (m: string) => m.slice(0, 10) + "…")
      );
    } finally {
      setIsApproving(false);
    }
  };

  /* ---- Direct swap on pair ---- */
  const swap = async () => {
    try {
      setUiError("");
      setTransactionType("swap");
      if (!address) throw new Error("Connect your wallet first.");
      if (!amountUi || Number(amountUi) <= 0)
        throw new Error("Enter a valid amount.");
      if (!pair || !pair.isWbnbRvp)
        throw new Error("Pair not ready (RVP/WBNB).");

      if (Number(amountUi) > fromBalance)
        throw new Error("Amount exceeds your balance.");

      const user = address as `0x${string}`;
      const amountIn = parseUnits(amountUi, from.decimals);

      // A) WRAP (tBNB -> WBNB)
      if (isWrap(from, to)) {
        await call({
          abi: wbnbAbi,
          address: WBNB,
          functionName: "deposit",
          args: [],
          value: amountIn,
        } as any);
        return;
      }

      // B) UNWRAP (WBNB -> tBNB)
      if (isUnwrap(from, to)) {
        await call({
          abi: wbnbAbi,
          address: WBNB,
          functionName: "withdraw",
          args: [amountIn],
        });
        return;
      }

      // C) REAL SWAP VIA PAIR (UniswapV2 pattern)
      // We only support the single RVP/WBNB pair.
      const token0 = pair.token0!;
      const isToken0Wbnb = token0 === WBNB;

      // Determine if we're swapping *into* WBNB or RVP
      const fromIsWbnb = !from.native && getAddress(from.address!) === WBNB;
      const fromIsRvp = !from.native && getAddress(from.address!) === ASSET;
      const toIsWbnb = !to.native && getAddress(to.address!) === WBNB;
      const toIsRvp = !to.native && getAddress(to.address!) === ASSET;

      // RVP -> tBNB: swap to WBNB then unwrap after swap
      const willUnwrapAfter = fromIsRvp && to.native ? true : false;

      // Define tokenIn for the transfer step
      const effectiveFrom = from.native ? { ...TOKENS[1] } : from; // if tBNB, we just wrapped to WBNB

      // tBNB -> RVP: wrap then swap
      if (from.native && toIsRvp) {
        await call({
          abi: wbnbAbi,
          address: WBNB,
          functionName: "deposit",
          args: [],
          value: amountIn,
        } as any);
      }

      // 1) Transfer tokenIn directly to pair (ERC-20 transfer from user)
      await call({
        abi: erc20Abi,
        address: effectiveFrom.address as `0x${string}`,
        functionName: "transfer",
        args: [PAIR_ASSET_WBNB, amountIn],
      });

      // 2) Calculate output amounts
      let amount0Out = BigInt(0),
        amount1Out = BigInt(0);

      // Case: WBNB -> RVP (or tBNB->WBNB->RVP)
      if (
        effectiveFrom.address &&
        getAddress(effectiveFrom.address) === WBNB &&
        (toIsRvp || willUnwrapAfter === false)
      ) {
        const reserveIn = isToken0Wbnb ? pair.r0 : pair.r1;
        const reserveOut = isToken0Wbnb ? pair.r1 : pair.r0;
        const out = getAmountOut(amountIn, reserveIn, reserveOut);
        const min = (out * BigInt(10_000 - slippageBps)) / BigInt(10_000);
        if (out < min) throw new Error("Slippage too high.");
        // output = RVP
        if (isToken0Wbnb) {
          amount0Out = BigInt(0);
          amount1Out = out;
        } else {
          amount0Out = out;
          amount1Out = BigInt(0);
        }
      }
      // Case: RVP -> WBNB
      else {
        const reserveIn = isToken0Wbnb ? pair.r1 : pair.r0;
        const reserveOut = isToken0Wbnb ? pair.r0 : pair.r1;
        const out = getAmountOut(amountIn, reserveIn, reserveOut);
        const min = (out * BigInt(10_000 - slippageBps)) / BigInt(10_000);
        if (out < min) throw new Error("Slippage too high.");
        // output = WBNB
        if (isToken0Wbnb) {
          amount0Out = out;
          amount1Out = BigInt(0);
        } else {
          amount0Out = BigInt(0);
          amount1Out = out;
        }
      }

      // 3) Call pair.swap with correct side
      await call({
        abi: pairAbi,
        address: PAIR_ASSET_WBNB,
        functionName: "swap",
        args: [amount0Out, amount1Out, user, "0x"],
      });

      // 4) If we wanted tBNB, unwrap received WBNB
      if (willUnwrapAfter) {
        const out = rawOut ?? BigInt(0); // best-effort
        await call({
          abi: wbnbAbi,
          address: WBNB,
          functionName: "withdraw",
          args: [out > BigInt(0) ? out : BigInt(0)],
        });
      }
    } catch (err: any) {
      if (err?.userRejected || err?.code === 4001) {
        setUiError("Transaction cancelled.");
        return;
      }
      const msg = err?.shortMessage || err?.message || "Swap failed.";
      setUiError(
        msg.replace(/0x[a-fA-F0-9]{20,}/g, (m: string) => m.slice(0, 10) + "…")
      );
    }
  };

  /* -------------------- UI (Tailwind CSS) -------------------- */
  return (
    <section className="pt-24 h-screen pb-24">
      <div className="max-w-xl mx-auto">
        <div className="border border-slate-700/60 rounded-xl bg-gradient-to-r from-slate-950/85 to-slate-900/85 overflow-hidden backdrop-blur-lg shadow-2xl">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-center text-2xl font-black bg-gradient-to-r from-purple-600 to-cyan-400 bg-clip-text text-transparent">
              Swap RVP
            </h2>
          </div>

          <div className="px-5 pb-5 pt-4 grid gap-4">
            {/* FROM */}
            <div className="grid gap-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>From</span>
                <span
                  onClick={() => setAmountUi(fromBalance.toFixed(6))}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  Balance: {fromBalance.toFixed(6)} {from.symbol}
                </span>
              </div>
              <div className="grid gap-2">
                <Select
                  value={from.symbol}
                  onValueChange={(value) => {
                    const t = TOKENS.find((x) => x.symbol === value)!;
                    setFrom(t);
                    clearError();
                  }}
                >
                  <SelectTrigger className="h-14 text-lg w-full border-2 border-primary/60 hover:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKENS.map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        {t.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.0"
                  value={amountUi}
                  onChange={(e) => {
                    setAmountUi(e.target.value);
                    clearError();
                  }}
                  className="w-full h-14 text-lg px-4 py-2 border-2 border-primary/60 hover:border-primary"
                />
              </div>
            </div>

            {/* SWITCH */}
            <div className="flex justify-center py-2">
              <Button
                onClick={() => {
                  const tmp = from;
                  setFrom(to);
                  setTo(tmp);
                  clearError();
                }}
                className="w-10 h-10 rounded-full cursor-pointer transition-all duration-250 hover:border-violet-500 hover:shadow-[0_0_18px_rgba(139,92,246,0.35)]"
                title="Switch tokens"
              >
                <ArrowUpDown className="w-5 h-5" />
              </Button>
            </div>

            {/* TO */}
            <div className="grid gap-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>To</span>
              </div>
              <div className="grid gap-2">
                <Select
                  value={to.symbol}
                  onValueChange={(value) => {
                    const t = TOKENS.find((x) => x.symbol === value)!;
                    setTo(t);
                    clearError();
                  }}
                >
                  <SelectTrigger className="h-14 text-lg w-full border-2 border-primary/60 hover:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKENS.map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        {t.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={estOut}
                  disabled
                  className="w-full h-14 text-lg px-4 py-2 border-2 border-primary/60"
                />
              </div>

              {/* Amount preview */}
              {routeMsg && (
                <small className="block mt-1.5 text-red-500">{routeMsg}</small>
              )}
            </div>

            {/* Slippage */}
            <div className="mt-1.5">
              <small className="opacity-80">
                Slippage:
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={slippageBps}
                  onChange={(e) =>
                    setSlippageBps(Math.max(0, Number(e.target.value || 0)))
                  }
                  className="w-16 ml-2 h-8 text-sm border-2 border-primary/60 hover:border-primary"
                />{" "}
                bps
              </small>
            </div>

            {/* ACTION */}
            {needsApproval && !isApproved ? (
              <Button
                type="button"
                onClick={approve}
                className="w-full h-12 border-0 rounded-xl cursor-pointer font-bold tracking-wide  transition-all duration-250 hover:shadow-[0_0_22px_rgba(34,211,238,0.35),0_0_22px_rgba(124,58,237,0.35)_inset] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!amountUi || isApproving || isPending || (isMining && transactionType === "approval")}
              >
                {isApproving ? "Approving…" : isPending ? "Sign…" : isMining && transactionType === "approval" ? "Approving…" : "Approve"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={swap}
                className="w-full h-12 border-0 rounded-xl cursor-pointer font-bold tracking-wide  transition-all duration-250 hover:shadow-[0_0_22px_rgba(34,211,238,0.35),0_0_22px_rgba(124,58,237,0.35)_inset] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!amountUi || isPending || isMining}
              >
                {isPending ? "Sign…" : isMining ? "Swapping…" : "Swap"}
              </Button>
            )}

            {/* FEEDBACK */}
            <div className="mt-2.5">
              {txHash && (
                <small className="text-slate-300">
                  tx:{" "}
                  <a
                    href={`https://testnet.bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    {txHash.slice(0, 10)}…
                  </a>
                </small>
              )}
              {isConfirmed && (
                <small className="text-green-400"> ✅ Confirmed</small>
              )}
              {uiError && (
                <small className="block mt-2 text-red-500">{uiError}</small>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
