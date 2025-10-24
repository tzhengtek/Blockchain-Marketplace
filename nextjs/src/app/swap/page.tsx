"use client";

import { useEffect, useMemo, useState } from "react";
import "./swap.css";
import { useAccount, useReadContract, useBalance } from "wagmi";
import {
  erc20Abi,
  formatUnits,
  getAddress,
  parseUnits,
  zeroAddress,
} from "viem";
import { useContractWriter } from "@/utils/wagmi/useContractWriter";

/* -------------------- Addresses (BSC Testnet) -------------------- */
const WBNB = getAddress("0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd");
const ASSET = getAddress("0x3DC23E01d7B7555970823274054047E521290C23");
const PAIR_ASSET_WBNB = getAddress(
  "0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7"
);

/* -------------------- ABIs -------------------- */
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
  symbol: "tBNB" | "WBNB" | "ASSET";
  address: `0x${string}` | null; // null = native (tBNB)
  decimals: number;
  native?: boolean;
};

const TOKENS: readonly TokenInfo[] = [
  { symbol: "tBNB", address: null, decimals: 18, native: true },
  { symbol: "WBNB", address: WBNB, decimals: 18 },
  { symbol: "ASSET", address: ASSET, decimals: 18 },
];

/* -------------------- AMM math (direct pair) -------------------- */
/** Fee 0.25% like Pancake v2. */
const FEE_NUM = 9975n;
const FEE_DEN = 10000n;

function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
  const amountInWithFee = amountIn * FEE_NUM;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * FEE_DEN + amountInWithFee;
  return denominator === 0n ? 0n : numerator / denominator;
}

/* -------------------- Helpers -------------------- */
const isWrap = (from: TokenInfo, to: TokenInfo) =>
  from.native && !to.native && getAddress(to.address!) === WBNB;
const isUnwrap = (from: TokenInfo, to: TokenInfo) =>
  !from.native && getAddress(from.address!) === WBNB && to.native;

/* -------------------- Page -------------------- */
export default function SwapPage() {
  const { address } = useAccount();
  const { call, txHash, isPending, isMining, isConfirmed } =
    useContractWriter();

  const [from, setFrom] = useState<TokenInfo>(TOKENS[0]); // tBNB
  const [to, setTo] = useState<TokenInfo>(TOKENS[2]); // ASSET
  const [amountUi, setAmountUi] = useState("");
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%
  const [uiError, setUiError] = useState("");

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
      const v = nativeBal.data?.value ?? 0n;
      return Number(formatUnits(v, 18));
    }
    const v = (fromErc20Raw as bigint | undefined) ?? 0n;
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
      const r0 = reservesRaw ? ((reservesRaw as any)[0] as bigint) : 0n;
      const r1 = reservesRaw ? ((reservesRaw as any)[1] as bigint) : 0n;
      const isWbnbAsset =
        token0 &&
        token1 &&
        ((token0 === WBNB && token1 === ASSET) ||
          (token0 === ASSET && token1 === WBNB));
      return { token0, token1, r0, r1, isWbnbAsset };
    } catch {
      return null;
    }
  }, [t0, t1, reservesRaw]);

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
        if (!pair || !pair.isWbnbAsset) {
          setRouteMsg("Pair is not ASSET/WBNB or reserves not loaded.");
          return;
        }

        // WRAP/UNWRAP: 1:1 quote
        if (isWrap(from, to) || isUnwrap(from, to)) {
          const amt = parseUnits(amountUi, 18);
          const min = (amt * BigInt(10_000 - slippageBps)) / 10_000n;
          if (!cancel) {
            setRawOut(amt);
            setEstOut(formatUnits(amt, 18));
            setMinOut(formatUnits(min, 18));
          }
          return;
        }

        // Only allow swaps that involve the ASSET/WBNB pair
        const isFromWbnb = !from.native && getAddress(from.address!) === WBNB;
        const isToWbnb = !to.native && getAddress(to.address!) === WBNB;
        const isFromAsset = !from.native && getAddress(from.address!) === ASSET;
        const isToAsset = !to.native && getAddress(to.address!) === ASSET;

        // tBNB<->ASSET go through wrap/unwrap + pair — valid
        // WBNB<->ASSET go directly — valid
        const valid =
          (isFromWbnb && isToAsset) ||
          (isFromAsset && isToWbnb) ||
          (from.native && isToAsset) ||
          (isFromAsset && to.native);

        if (!valid) {
          setRouteMsg(
            "Unsupported route (this file only handles ASSET/WBNB pair)."
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

        // Case A: WBNB -> ASSET (or tBNB->ASSET after wrapping)
        if ((isFromWbnb && isToAsset) || (from.native && isToAsset)) {
          // input = WBNB; output = ASSET
          reserveIn = isToken0Wbnb ? pair.r0 : pair.r1;
          reserveOut = isToken0Wbnb ? pair.r1 : pair.r0;
        }
        // Case B: ASSET -> WBNB (or ASSET->tBNB then unwrap)
        else {
          // input = ASSET; output = WBNB
          reserveIn = isToken0Wbnb ? pair.r1 : pair.r0;
          reserveOut = isToken0Wbnb ? pair.r0 : pair.r1;
        }

        const out = getAmountOut(amountIn, reserveIn, reserveOut);
        if (out === 0n) {
          setRouteMsg("Insufficient liquidity or wrong fee assumption.");
          return;
        }

        const min = (out * BigInt(10_000 - slippageBps)) / 10_000n;
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

  /* ---- Direct swap on pair ---- */
  const swap = async () => {
    try {
      setUiError("");
      if (!address) throw new Error("Connect your wallet first.");
      if (!amountUi || Number(amountUi) <= 0)
        throw new Error("Enter a valid amount.");
      if (!pair || !pair.isWbnbAsset)
        throw new Error("Pair not ready (ASSET/WBNB).");

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
      // We only support the single ASSET/WBNB pair.
      const token0 = pair.token0!;
      const isToken0Wbnb = token0 === WBNB;

      // Determine if we're swapping *into* WBNB or ASSET
      const fromIsWbnb = !from.native && getAddress(from.address!) === WBNB;
      const fromIsAsset = !from.native && getAddress(from.address!) === ASSET;
      const toIsWbnb = !to.native && getAddress(to.address!) === WBNB;
      const toIsAsset = !to.native && getAddress(to.address!) === ASSET;

      // tBNB -> ASSET: wrap then swap
      if (from.native && toIsAsset) {
        // wrap
        await call({
          abi: wbnbAbi,
          address: WBNB,
          functionName: "deposit",
          args: [],
          value: amountIn,
        } as any);
        // then treat as WBNB -> ASSET below
        // update local state to avoid confusion
      }

      // ASSET -> tBNB: swap to WBNB then unwrap after swap
      const willUnwrapAfter = fromIsAsset && to.native ? true : false;

      // Define tokenIn for the transfer step
      const effectiveFrom = from.native ? { ...TOKENS[1] } : from; // if tBNB, we just wrapped to WBNB

      // 1) Transfer tokenIn directly to pair (ERC-20 transfer from user)
      await call({
        abi: erc20Abi,
        address: effectiveFrom.address as `0x${string}`,
        functionName: "transfer",
        args: [PAIR_ASSET_WBNB, amountIn],
      });

      // 2) Call pair.swap with correct side
      //    amount0Out/amount1Out depends on which side is output relative to token0/token1
      let amount0Out = 0n,
        amount1Out = 0n;

      // Case: WBNB -> ASSET (or tBNB->WBNB->ASSET)
      if (
        effectiveFrom.address &&
        getAddress(effectiveFrom.address) === WBNB &&
        (toIsAsset || willUnwrapAfter === false)
      ) {
        const reserveIn = isToken0Wbnb ? pair.r0 : pair.r1;
        const reserveOut = isToken0Wbnb ? pair.r1 : pair.r0;
        const out = getAmountOut(amountIn, reserveIn, reserveOut);
        const min = (out * BigInt(10_000 - slippageBps)) / 10_000n;
        if (out < min) throw new Error("Slippage too high.");
        // output = ASSET
        if (isToken0Wbnb) {
          amount0Out = 0n;
          amount1Out = out;
        } else {
          amount0Out = out;
          amount1Out = 0n;
        }
      }
      // Case: ASSET -> WBNB
      else {
        const reserveIn = isToken0Wbnb ? pair.r1 : pair.r0;
        const reserveOut = isToken0Wbnb ? pair.r0 : pair.r1;
        const out = getAmountOut(amountIn, reserveIn, reserveOut);
        const min = (out * BigInt(10_000 - slippageBps)) / 10_000n;
        if (out < min) throw new Error("Slippage too high.");
        // output = WBNB
        if (isToken0Wbnb) {
          amount0Out = out;
          amount1Out = 0n;
        } else {
          amount0Out = 0n;
          amount1Out = out;
        }
      }

      // 3) swap to user (or to this EOA then unwrap)
      await call({
        abi: pairAbi,
        address: PAIR_ASSET_WBNB,
        functionName: "swap",
        args: [amount0Out, amount1Out, user, "0x"],
      });

      // 4) If we wanted tBNB, unwrap received WBNB
      if (willUnwrapAfter) {
        const out = rawOut ?? 0n; // best-effort
        await call({
          abi: wbnbAbi,
          address: WBNB,
          functionName: "withdraw",
          args: [out > 0n ? out : 0n], // if we don't know exact, you can put amount1Out/amount0Out accordingly
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

  /* -------------------- UI (keeps your DA/classes) -------------------- */
  return (
    <section className="section">
      <div className="swap-container">
        <div className="card glass shadow">
          <div className="cardHeader">
            <h2 className="cardTitle">Swap (direct pair)</h2>
          </div>

          <div className="cardContent">
            {/* FROM */}
            <div className="fieldGroup">
              <div className="labelRow">
                <span>From</span>
                <span>
                  Balance: {fromBalance.toFixed(6)} {from.symbol}
                </span>
              </div>
              <div className="inputWrap">
                <select
                  className="tokenSelect"
                  value={from.symbol}
                  onChange={(e) => {
                    const t = TOKENS.find(
                      (x) => x.symbol === (e.target.value as any)
                    )!;
                    setFrom(t);
                    clearError();
                  }}
                >
                  {TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.0"
                  value={amountUi}
                  onChange={(e) => {
                    setAmountUi(e.target.value);
                    clearError();
                  }}
                  className="input"
                />
              </div>
            </div>

            {/* SWITCH */}
            <div className="switchRow">
              <button
                onClick={() => {
                  const tmp = from;
                  setFrom(to);
                  setTo(tmp);
                  clearError();
                }}
                className="switchBtn"
                title="Switch tokens"
              />
            </div>

            {/* TO */}
            <div className="fieldGroup">
              <div className="labelRow">
                <span>To</span>
              </div>
              <div className="inputWrap">
                <select
                  className="tokenSelect"
                  value={to.symbol}
                  onChange={(e) => {
                    const t = TOKENS.find(
                      (x) => x.symbol === (e.target.value as any)
                    )!;
                    setTo(t);
                    clearError();
                  }}
                >
                  {TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount preview */}
              {routeMsg && (
                <small
                  style={{ display: "block", marginTop: 6, color: "tomato" }}
                >
                  {routeMsg}
                </small>
              )}
              {!routeMsg && rawOut !== null && (
                <small style={{ display: "block", marginTop: 6, opacity: 0.8 }}>
                  You would get:{" "}
                  <b>
                    {estOut} {to.symbol}
                  </b>{" "}
                  · Min received (slippage {slippageBps / 100}%):{" "}
                  <b>
                    {minOut} {to.symbol}
                  </b>
                </small>
              )}
            </div>

            {/* Slippage */}
            <div style={{ marginTop: 6 }}>
              <small style={{ opacity: 0.8 }}>
                Slippage:
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={slippageBps}
                  onChange={(e) =>
                    setSlippageBps(Math.max(0, Number(e.target.value || 0)))
                  }
                  style={{ width: 70, marginLeft: 8 }}
                />{" "}
                bps
              </small>
            </div>

            {/* ACTION */}
            <button
              type="button"
              onClick={swap}
              className="primaryBtn"
              disabled={!amountUi || isPending || isMining}
            >
              {isPending ? "Sign…" : isMining ? "Swapping…" : "Swap"}
            </button>

            {/* FEEDBACK */}
            <div style={{ marginTop: 10 }}>
              {txHash && (
                <small>
                  tx:{" "}
                  <a
                    href={`https://testnet.bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {txHash.slice(0, 10)}…
                  </a>
                </small>
              )}
              {isConfirmed && <small> ✅ Confirmed</small>}
              {uiError && (
                <small
                  style={{ color: "tomato", display: "block", marginTop: 8 }}
                >
                  {uiError}
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
