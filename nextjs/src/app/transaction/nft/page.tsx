"use client";

import React, { JSX, useMemo, useState } from "react";
import { useNft } from "@/hooks/use-nft";
import { Nft } from "@/types/nft";
import { getBscScanAddressUrl, getBscScanTokenUrl } from "@/utils/bscscan";
import { NftSkeleton } from "@/components/skeletons/nft-skeleton";

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

export default function NftPage(): JSX.Element {
  const [owner, setOwner] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useNft({
    owner: owner,
    page: page,
  });

  const nfts = data?.nfts ?? [];
  const total = data?.total ?? 0;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  if (isLoading) return <NftSkeleton />;
  if (isError) return <div className="text-red-500 pl-16 text-center py-8">Error loading NFTs</div>;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleGoto = (p: number) => setPage(p);

  const startIndex = (page - 1) * PAGE_SIZE + 1;
  return (
    <div className="p-8">
      <div className="relative flex items-center justify-center mb-8">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 text-white px-4 py-2 rounded-md transition cursor-pointer hover:bg-[#2f3b8f]"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-white">NFT ownerships</h1>
      </div>
      <div className="flex items-center gap-4 flex-wrap mb-8">
        <input
          className="px-4 py-2.5 rounded-lg text-white mb-8 bg-[rgb(42,42,42)] w-[400px] h-10 border border-transparent placeholder:text-[#b0b0b0] placeholder:opacity-100 placeholder:pl-1 focus:outline-none focus:bg-white/5 focus:text-white"
          type="text"
          placeholder="Owner address ..."
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-x-[22px] font-semibold py-2.5 px-4 border-b-[3px] border-[#242936]">
        <div>Owner</div>
        <div>Token ID</div>
        <div>Address</div>
      </div>
      {nfts.map((t: Nft) => (
        <div key={`${t.token_id}`} className="grid grid-cols-[1fr_120px_1fr] items-center gap-x-[22px] py-3.5 px-4 border-b border-[#242936] bg-transparent hover:bg-white/[0.031]">
          <div className="flex text-blue-400 underline hover:cursor-pointer hover:text-blue-300 truncate">
            <a
              href={getBscScanAddressUrl(t.owner)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors truncate"
              title={t.owner}
            >
              {t.owner}
            </a>
          </div>
          <div title={t.token_id} className="text-center">{t.token_id}</div>
          <div className="flex text-blue-400 underline hover:cursor-pointer hover:text-blue-300 truncate">
            <a
              href={getBscScanTokenUrl(t.contract_address, t.token_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors truncate"
              title={t.contract_address}
            >
              {t.contract_address}
            </a>
          </div>
        </div>
      ))}
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
    </div>
  );
}
