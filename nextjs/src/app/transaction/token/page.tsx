"use client";

import React, { JSX, useMemo, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { Transaction } from "@/types/transaction";
import { getBscScanAddressUrl, getBscScanTxUrl } from "@/utils/bscscan";
import { TransactionSkeleton } from "@/components/skeletons/transaction-skeleton";

const PAGE_SIZE = 50;

function copyToClipboard(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).catch(console.error);
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "enter" || e.key === "Enter") {
    e.preventDefault();
  }
};

export default function Token(): JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [fromAddress, setFromAddress] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [showErrors, setShowErrors] = useState(false);

  const { data, isLoading, isError } = useTransactions({
    hash_address: transactionHash,
    page: page,
    from_address: fromAddress,
    to_address: toAddress,
  });

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  if (isError) return <div className="text-red-500 pl-16 text-center py-8">Error loading transactions</div>;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleGoto = (p: number) => setPage(p);

  const getInputClass = (value: string) =>
    `px-4 py-2.5 rounded-lg text-white mb-8 bg-[rgb(42,42,42)] w-[400px] h-10 border placeholder:text-[#b0b0b0] placeholder:opacity-100 placeholder:pl-1 focus:outline-none focus:bg-white/5 focus:text-white ${
      showErrors && !value ? "border-red-500" : "border-transparent"
    }`;

  return (
    <section className="p-8">
      <div className="relative flex items-center justify-center mb-8">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 text-white px-4 py-2 rounded-md transition cursor-pointer hover:bg-[#2f3b8f]"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-white">
          Transaction history
        </h1>
      </div>
      <div className="flex items-center gap-4 flex-wrap mb-8">
        <input
          className={getInputClass(transactionHash)}
          type="text"
          placeholder="Transaction hash ..."
          value={transactionHash}
          onChange={(e) => setTransactionHash(e.target.value)}
        />
        <input
          className={getInputClass(fromAddress)}
          type="text"
          placeholder="From address ..."
          value={fromAddress}
          onChange={(e) => setFromAddress(e.target.value)}
        />
        <input
          className={getInputClass(toAddress)}
          type="text"
          placeholder="To address ..."
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-[180px_180px_180px_180px_180px_180px_180px_180px] items-center gap-x-[22px] font-semibold py-2.5 px-4 border-b-[3px] border-[#242936]">
        <div>Hash</div>
        <div>From</div>
        <div>To</div>
        <div>Value</div>
        <div>Block ID</div>
        <div>Contract</div>
        <div>Date</div>
      </div>
      {isLoading ? (
        <TransactionSkeleton />
      ) : (
        transactions.map((t: Transaction) => (
          <div className="grid grid-cols-[180px_180px_180px_180px_180px_180px_180px_180px] items-center gap-x-[22px] py-3.5 px-4 border-b border-[#242936] bg-transparent hover:bg-white/[0.031]" key={t.transaction_hash}>
            <div className="flex text-blue-400 underline hover:cursor-pointer hover:text-blue-300">
              <a
                href={getBscScanTxUrl(t.transaction_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.transaction_hash.slice(0, 10)}…
              </a>
            </div>
            <div className="flex text-blue-400 underline hover:cursor-pointer hover:text-blue-300">
              <a
                href={getBscScanAddressUrl(t.from_address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.from_address.slice(0, 10)}…
              </a>
            </div>
            <div className="flex text-blue-400 underline hover:cursor-pointer hover:text-blue-300">
              <a
                href={getBscScanAddressUrl(t.to_address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.to_address.slice(0, 10)}…
              </a>
            </div>
            <div>{t.value}</div>
            <div>{t.block_id}</div>
            <div className="flex text-blue-400 underline hover:cursor-pointer hover:text-blue-300">
              {t.contract_address ? (
                <a
                  href={getBscScanAddressUrl(t.contract_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t.contract_address.slice(0, 10)}…
                </a>
              ) : (
                "—"
              )}
            </div>
            <div>{new Date(t.timestamp).toLocaleString()}</div>
          </div>
        ))
      )}
      <div className="flex gap-1.5 items-center justify-center mt-4 flex-wrap">
        <button
          className="bg-[#2f3b8f] px-2.5 py-1.5 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePrev}
          disabled={page === 1}
          aria-label="Page précédente"
        >
          ◀
        </button>
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          const isEdge = p === 1 || p === totalPages;
          const near = Math.abs(p - page) <= 2;
          if (!isEdge && !near) return null;
          return (
            <button
              key={p}
              className={`bg-[#2f3b8f] px-2.5 py-1.5 rounded-md cursor-pointer ${
                p === page ? "outline outline-2 outline-[rgb(66,66,66)] font-semibold" : ""
              }`}
              onClick={() => handleGoto(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}
        <button
          className="bg-[#2f3b8f] px-2.5 py-1.5 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={page === totalPages}
          aria-label="Page suivante"
        >
          ▶
        </button>
      </div>
    </section>
  );
}
