"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import "./nft.css";

type Nft = {
  owner: string;
  token_id: string | number;
  contract_address: string;
};

const data = [
  {
    owner: "0x561ff221845884b970f2fa436c07313a0df8f3281a1c4264a0330bbed0537217",
    token_id: "1",
    contract_address: "0x58b704065B7aFF3ED351052f8560019E05925023",
  },
  {
    owner: "0xc418026d3a161ee8927dd686d6f8b6533bec2c76eec3295b266aea25b0742c5c",
    token_id: "2",
    contract_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
];

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
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    // Fetch NFT data if needed
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  // if (loading) return <div className="hint">Loading...</div>;
  // if (error) return <div className="error">Error: {error}</div>;

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
      <div className="search_bar">
        <input
          type="text"
          placeholder="Search address ..."
          value={search}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="section_header">
        <div>Owner</div>
        <div>Token ID</div>
        <div>Address</div>
      </div>
      {data.map((t) => (
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
