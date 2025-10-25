"use client";

import { JSX } from "react";

export default function Token(): JSX.Element {
  return (
    <div className="p-8">
      <button
        onClick={() => window.history.back()}
        className="text-white px-4 py-2 rounded-md transition cursor-pointer mb-4 hover:bg-[#2f3b8f]"
      >
        ← Back
      </button>
      <h2>Token Transactions Page</h2>
    </div>
  );
}
