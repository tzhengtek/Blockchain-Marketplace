"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import "./nft.css";
import { getNft } from "@/utils/request";

type Nft = {
  owner: string;
  token_id: string | undefined;
  contract_address: string;
};

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

export default function Nft(): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [owner, setOwner] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getNft({
          owner: owner,
          page: page,
        });
        setTotal(res.total ?? 0);
        if (res.nfts) {
          setNfts(res.nfts ?? []);
        } else {
          setNfts([]);
        }
      } catch (e: any) {
        setNfts([]);
      } finally {
        setLoading(false);
        setIsSearch(false);
      }
    })();
  }, [page, isSearch]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  if (loading) return <div className="hint">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleGoto = (p: number) => setPage(p);

  const startIndex = (page - 1) * PAGE_SIZE + 1;
  return (
    <div className="section">
      <div className="relative flex items-center justify-center mb-8">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 text-white px-4 py-2 rounded-md transition cursor-pointer hover:bg-[#2f3b8f]"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-white">NFT ownerships</h1>
      </div>
      <div className="input_section">
        <input
          className="input_container"
          type="text"
          placeholder="Owner address ..."
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <div className="relative flex items-center justify-center mb-8">
          <button
            onClick={() => {
              setIsSearch(true);
            }}
            className="absolute left-0 text-white px-4 py-2 rounded-md cursor-pointer
             bg-[#2f3b8f] transition-all duration-300
             hover:-translate-y-1 hover:shadow-lg
             active:translate-y-1 active:shadow-md"
          >
            Search
          </button>
        </div>
      </div>
      <div className="section_header">
        <div>Owner</div>
        <div>Token ID</div>
        <div>Address</div>
      </div>
      {nfts.map((t) => (
        <div key={`${t.token_id}`} className="data_container">
          <div
            title={t.owner}
            className="address_info"
            onClick={() => copyToClipboard(t.owner)}
          >
            {t.owner.slice(0, 10)}…
          </div>
          <div title={t.token_id}>{t.token_id}</div>
          <div
            title={t.contract_address}
            className="address_info"
            onClick={() => copyToClipboard(t.contract_address)}
          >
            {t.contract_address}
          </div>
        </div>
      ))}
      <div className="pagination">
        <button
          className="page_btn"
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
              className={`page_num ${p === page ? "active" : ""}`}
              onClick={() => handleGoto(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}
        <button
          className="page_btn"
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
