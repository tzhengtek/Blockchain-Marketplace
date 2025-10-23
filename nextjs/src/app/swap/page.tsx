"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select"

const MOCK_TOKENS = [
  { id: "eth", label: "ETH", symbol: "ETH" },
  { id: "usdc", label: "USDC", symbol: "USDC" },
  { id: "dai", label: "DAI", symbol: "DAI" },
  { id: "usdt", label: "USDT", symbol: "USDT" },
]

export default function SwapPage() {
  const [fromToken, setFromToken] = useState("eth")
  const [toToken, setToToken] = useState("usdc")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSwap = async () => {
    setIsLoading(true)
    // Simulate swap transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    alert(`Swapped ${fromAmount} ${fromToken.toUpperCase()} for ${toAmount} ${toToken.toUpperCase()}`)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value
    setFromAmount(amount)
    // Mock conversion (1:1000 for demo)
    setToAmount((parseFloat(amount) * 1000 || 0).toString())
  }

  const swapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Token Swap</h1>
        <p className="text-muted-foreground mb-8">
          Exchange tokens across multiple blockchain networks with competitive rates
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Swap Tokens</CardTitle>
            <CardDescription>
              Select tokens and amounts to swap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Section */}
            <div className="space-y-3">
              <Label htmlFor="from-token">From</Label>
              <div className="flex gap-3">
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TOKENS.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        {token.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="from-amount"
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={handleAmountChange}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: 10.5 {fromToken.toUpperCase()}
              </p>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapTokens}
                className="rounded-full"
              >
                ⇅
              </Button>
            </div>

            {/* To Section */}
            <div className="space-y-3">
              <Label htmlFor="to-token">To</Label>
              <div className="flex gap-3">
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TOKENS.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        {token.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="to-amount"
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: 5,000.00 {toToken.toUpperCase()}
              </p>
            </div>

            {/* Price Info */}
            {fromAmount && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="text-muted-foreground">
                  1 {fromToken.toUpperCase()} = 1,000 {toToken.toUpperCase()}
                </p>
              </div>
            )}

            {/* Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={!fromAmount || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Swapping..." : "Swap Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Execute swaps in seconds with optimized gas fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Non-custodial swaps with your wallet in full control
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Multi-Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trade across Ethereum, Arbitrum, BSC, and more
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
