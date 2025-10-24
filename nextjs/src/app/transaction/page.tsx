"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import "./transaction.css";
import { getTransactions } from "@/utils/request";

type Transaction = {
  transaction_hash: string;
  from_address: string;
  to_address: string;
  timestamp: string;
  value: string | number;
  block_id: number;
  contract_address?: string | null;
};

const PAGE_SIZE = 10;

function copyToClipboard(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).catch(console.error);
}

export default function Transaction(): JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTransactions();
        if (Array.isArray(res) && res.length > 0) {
          setTotal(res[0].total ?? 0);
          setTransactions(res[0].transactions ?? []);
        } else if (res?.transactions) {
          setTotal(res.total ?? 0);
          setTransactions(res.transactions ?? []);
        } else {
          setError("Format de réponse inattendu");
        }
      } catch (e: any) {
        setError(e?.message ?? "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  }, [transactions.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return transactions.slice(start, start + PAGE_SIZE);
  }, [transactions, page]);

  useEffect(() => {
    setPage(1);
  }, [transactions.length]);

  if (loading) return <div className="hint">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleGoto = (p: number) => setPage(p);

  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, transactions.length);

  return (
    <section className="section">
      <div className="section_topbar"></div>

      <div className="section_header">
        <div>Hash</div>
        <div>From</div>
        <div>To</div>
        <div>Value</div>
        <div>Block ID</div>
        <div>Contract</div>
        <div>Date</div>
      </div>

      {pageItems.map((t) => (
        <div className="data_container" key={t.transaction_hash}>
          <div
            className="adress_info"
            title={t.transaction_hash}
            onClick={() => copyToClipboard(t.transaction_hash)}
          >
            {t.transaction_hash.slice(0, 10)}…
          </div>
          <div
            className="adress_info"
            title={t.from_address}
            onClick={() => copyToClipboard(t.from_address)}
          >
            {t.from_address.slice(0, 10)}…
          </div>
          <div
            className="adress_info"
            title={t.to_address}
            onClick={() => copyToClipboard(t.to_address)}
          >
            {t.to_address.slice(0, 10)}…
          </div>
          <div>{t.value}</div>
          <div>{t.block_id}</div>
          <div
            className="adress_info"
            title={t.contract_address ?? ""}
            onClick={() => copyToClipboard(t.contract_address ?? "")}
          >
            {t.contract_address ? t.contract_address.slice(0, 10) + "…" : "—"}
          </div>
          <div>{new Date(t.timestamp).toLocaleString()}</div>
        </div>
      ))}
      <div className="range">
        {startIndex}–{endIndex} / {transactions.length}
      </div>

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
    </section>
  );
}
