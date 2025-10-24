"use client"

import { useState } from "react"
import { useContractWriter } from "@/utils/wagmi/useContractWriter"
import { abi } from "@/utils/wagmi/erc20"

const TOKEN_ADDRESS = "0x3DC23E01d7B7555970823274054047E521290C23" // Ton token de test (ASSET)
const SPENDER = "0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7"   // Liquidity pair ou random address

export default function TestWriter() {
  const [hash, setHash] = useState<string | null>(null)
  const { call, txHash, isPending, isMining, isConfirmed, error } = useContractWriter()

  const handleApprove = async () => {
    try {
      const hash = await call({
        abi,
        address: TOKEN_ADDRESS,
        functionName: "approve",
        args: [SPENDER, BigInt(10 ** 18)], // 1 token si 18 décimales
      })
      setHash(hash)
    } catch (err) {
      console.error("❌ Transaction failed:", err)
    }
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Test Contract Writer</h2>
      <button
        onClick={handleApprove}
        disabled={isPending || isMining}
        className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
        style={{
          backgroundColor: isPending || isMining ? "#aaaaaa" : "#00aaff",
          cursor: isPending || isMining ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Pending..." : isMining ? "Mining..." : "Approve 1 token"}
      </button>

      {txHash && (
        <p className="mt-4 text-sm">
          ✅ Tx sent:{" "}
          <a
            href={`https://testnet.bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}
      {isConfirmed && <p className="mt-2 text-sm">🎉 Transaction confirmed!</p>}
      {error && <p className="mt-2 text-sm text-red-500">Error: {error.message}</p>}
    </div>
  )
}
