"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { erc20Abi, getAddress } from "viem"
import { useContractWriter } from "@/utils/wagmi/useContractWriter"

const TEST_TOKEN = getAddress("0x7ef95a0fee0df9a69da7e5c1db6f5c68b2c2c7b9") as `0x${string}`
const TEST_SPENDER = getAddress("0xD99D1c33F9fC3444f8101754aBC46c52416550D1") as `0x${string}`

export default function TestWriter() {
  const { address } = useAccount()
  const { call, txHash, isPending, isMining, isConfirmed, error } = useContractWriter()
  const [status, setStatus] = useState("")

  const handleApprove = async () => {
    try {
      setStatus("Sending tx…")
      const hash = await call({
        abi: erc20Abi,
        address: TEST_TOKEN,
        functionName: "approve",
        args: [TEST_SPENDER, 1n],
      })
      setStatus(`Tx sent: ${hash}`)
    } catch (err: any) {
      console.error(err)
      setStatus(`Error: ${err.shortMessage || err.message}`)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>🚀 Test: useContractWriter</h2>
      <p>Connected wallet: {address ?? "—"}</p>

      <button onClick={handleApprove} disabled={isPending || isMining}>
        {isPending || isMining ? "Processing…" : "Approve (test)"}
      </button>

      <div style={{ marginTop: 12 }}>
        <p><b>Status:</b> {status}</p>
        {txHash && (
          <p>
            <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">
              View on BscScan
            </a>
          </p>
        )}
        {isConfirmed && <p>✅ Confirmed</p>}
        {error && <p style={{ color: "tomato" }}>{error.message}</p>}
      </div>
    </div>
  )
}
