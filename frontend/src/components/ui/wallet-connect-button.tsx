"use client"

import { useAccount } from "wagmi"
import { Account } from "./profile"
import { WalletOptions } from "./wallet-option"

export function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}