"use client";

import { JSX, useState } from "react";
import "./swap.css";
import { Field, Input, NumberInput } from "@chakra-ui/react";

type Token = {
  symbol: string;
  name: string;
  balance: string;
  price: string;
};

const tokens: Token[] = [
  { symbol: "ETH", name: "Ethereum", balance: "2.45", price: "$1,920.00" },
  { symbol: "USDC", name: "USD Coin", balance: "1,250.00", price: "$1.00" },
  { symbol: "USDT", name: "Tether", balance: "890.50", price: "$1.00" },
  { symbol: "BTC", name: "Bitcoin", balance: "0.15", price: "$28,450.00" },
];

export default function Swap(): JSX.Element {
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
    setToAmount("");
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const rate = 1920;
      setToAmount((Number(value) * rate).toFixed(2));
    } else {
      setToAmount("");
    }
  };

  const handleSwap = () => {
    if (!fromAmount || !toAmount) {
      alert("Invalid Amount: Please enter a valid amount to swap");
      return;
    }

    alert(
      `Swap Initiated: Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`
    );
    setFromAmount("");
    setToAmount("");
  };

  return (
    <section className="section">
      <div className="swap-container">
        <div className="card glass shadow">
          <div className="cardHeader">
            <h2 className="cardTitle">Swap Tokens</h2>
          </div>
          <div className="cardContent">
            <div className="fieldGroup">
              <div className="labelRow">
                <span>From</span>
                <span>
                  Balance: {fromToken.balance} {fromToken.symbol}
                </span>
              </div>
              <div className="inputWrap">
                <input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="input"
                />
                <div className="tokenBadge">
                  <div className="tokenBadgeTextPrimary">
                    {fromToken.symbol}
                  </div>
                  <div className="tokenBadgeTextSecondary">
                    {fromToken.price}
                  </div>
                </div>
              </div>
            </div>
            <div className="switchRow">
              <button
                type="button"
                onClick={handleSwapTokens}
                className="switchBtn"
                aria-label="Swap tokens"
                title="Swap tokens"
              ></button>
            </div>

            {/* To */}
            <div className="fieldGroup">
              <div className="labelRow">
                <span>To</span>
                <span>
                  Balance: {toToken.balance} {toToken.symbol}
                </span>
              </div>

              <div className="inputWrap">
                <input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="input"
                />
                <div className="tokenBadge">
                  <div className="tokenBadgeTextPrimary">{toToken.symbol}</div>
                  <div className="tokenBadgeTextSecondary">{toToken.price}</div>
                </div>
              </div>
            </div>
            {fromAmount && toAmount && (
              <div className="rateBox">
                <div className="rateLeft">
                  <span className="rateLabel">Exchange Rate</span>
                </div>
                <span className="rateValue">
                  1 {fromToken.symbol} ={" "}
                  {(Number(toAmount) / Number(fromAmount)).toFixed(2)}{" "}
                  {toToken.symbol}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSwap}
              className="primaryBtn"
              disabled={!fromAmount || !toAmount}
            >
              Swap Tokens
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// import { JSX } from "react";
// import "./swap.css";
// import { Field, Input, NumberInput } from "@chakra-ui/react";

// export default function Swap(): JSX.Element {
//   return (

//     // <div className="container">
//     //   <div className="inner">
//     //     <div className="inner-collumn">
//     //       <div className="title-wrap">
//     //         <span className="swap-title">Swap Tokens</span>
//     //       </div>
//     //       <div className="input-wrap">
//     //         <Field.Root>
//     //           <Field.Label>From</Field.Label>
//     //           <NumberInput.Root defaultValue="0" width="200px" min={0}>
//     //             <NumberInput.Control />
//     //             <NumberInput.Input />
//     //           </NumberInput.Root>
//     //         </Field.Root>
//     //       </div>
//     //       <div className="input-wrap">
//     //         <Field.Root>
//     //           <Field.Label>From</Field.Label>
//     //           <NumberInput.Root defaultValue="0" width="200px" min={0}>
//     //             <NumberInput.Control />
//     //             <NumberInput.Input />
//     //           </NumberInput.Root>
//     //         </Field.Root>
//     //       </div>
//     //       <div className="actions">
//     //         <button type="button" className="swap-button">
//     //           Swap tokens
//     //         </button>
//     //       </div>
//     //     </div>
//     //   </div>
//     // </div>
//   );
// }
