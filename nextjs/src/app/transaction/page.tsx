"use client";

import React, { JSX } from "react";
import "./transaction.css";

export default function Transaction(): JSX.Element {
  const navItems = [
    {
      label: "Token",
      href: "/transaction/token",
      description: "View your token transactions history",
    },
    {
      label: "NFT",
      href: "/transaction/nft",
      description: "View NFT ownerships",
    },
    // {
    //   label: "Token",
    //   href: "/transaction/token",
    //   description: "View your token transactions",
    // },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {navItems.map((item) => (
          <a
            key={item.label}
            className="rounded-lg border border-border bg-card p-6 cursor-pointer transition-all duration-300 hover:bg-[#2f3b8f] hover:-translate-y-1 hover:shadow-lg"
            href={item.href}
          >
            <div className="text-2xl font-semibold mb-2">{item.label}</div>
            <p className="text-muted-foreground">{item.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
