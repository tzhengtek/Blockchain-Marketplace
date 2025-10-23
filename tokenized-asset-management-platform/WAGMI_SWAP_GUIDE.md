# Wagmi + WalletConnect Swap Integration Guide

Complete guide for integrating ATK token swaps into your React/Next.js frontend using wagmi and WalletConnect.

## Table of Contents
- [Installation](#installation)
- [Wagmi Configuration](#wagmi-configuration)
- [Contract ABIs](#contract-abis)
- [Swap Component](#swap-component)
- [Complete Example](#complete-example)
- [KYC Check Integration](#kyc-check-integration)

---

## Installation

Install required dependencies:

```bash
npm install wagmi viem @tanstack/react-query
npm install @web3modal/wagmi @web3modal/ethereum
```

Or with yarn:

```bash
yarn add wagmi viem @tanstack/react-query
yarn add @web3modal/wagmi @web3modal/ethereum
```

---

## Wagmi Configuration

Create a `wagmi.config.ts` file:

```typescript
import { http, createConfig } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

// Get your project ID from https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'Asset Token Management',
        description: 'KYC-enabled asset trading platform',
        url: 'https://yourdomain.com',
        icons: ['https://yourdomain.com/icon.png']
      }
    }),
  ],
  transports: {
    [bscTestnet.id]: http('https://bnb-testnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY'),
  },
})
```

---

## Wrap Your App

In your `app/layout.tsx` or `_app.tsx`:

```typescript
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi.config'

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
```

---

## Contract ABIs

Create `contracts/abis.ts`:

```typescript
// PancakeSwap Router ABI (minimal for swaps)
export const PANCAKE_ROUTER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactETHForTokens',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForETH',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'address[]', name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 ABI (for token approval and balance)
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// KYC Registry ABI
export const KYC_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isKYCVerified',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
```

---

## Contract Addresses

Create `contracts/addresses.ts`:

```typescript
export const CONTRACTS = {
  KYC_REGISTRY: '0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe',
  ASSET_TOKEN: '0x3DC23E01d7B7555970823274054047E521290C23',
  ASSET_NFT: '0xad6eD2CbBFB45Da005111356Fe280d10a7044371',
  LIQUIDITY_PAIR: '0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7',
  PANCAKE_ROUTER: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
} as const
```

---

## Swap Component

Create `components/TokenSwap.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useBalance
} from 'wagmi'
import { parseEther, formatEther, formatUnits } from 'viem'
import { CONTRACTS } from '@/contracts/addresses'
import { PANCAKE_ROUTER_ABI, ERC20_ABI, KYC_REGISTRY_ABI } from '@/contracts/abis'

type SwapDirection = 'BNB_TO_ATK' | 'ATK_TO_BNB'

export default function TokenSwap() {
  const { address, isConnected } = useAccount()
  const [swapDirection, setSwapDirection] = useState<SwapDirection>('BNB_TO_ATK')
  const [inputAmount, setInputAmount] = useState('')
  const [expectedOutput, setExpectedOutput] = useState<bigint>(0n)
  const [slippage, setSlippage] = useState(5) // 5% default slippage

  // Contract write hooks
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Get BNB balance
  const { data: bnbBalance } = useBalance({
    address: address,
  })

  // Get ATK token balance
  const { data: atkBalance } = useReadContract({
    address: CONTRACTS.ASSET_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Check KYC status
  const { data: isKYCVerified } = useReadContract({
    address: CONTRACTS.KYC_REGISTRY,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isKYCVerified',
    args: address ? [address] : undefined,
  })

  // Get token allowance
  const { data: allowance } = useReadContract({
    address: CONTRACTS.ASSET_TOKEN,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.PANCAKE_ROUTER] : undefined,
  })

  // Get expected output amount
  const { data: amountsOut } = useReadContract({
    address: CONTRACTS.PANCAKE_ROUTER,
    abi: PANCAKE_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: inputAmount && parseFloat(inputAmount) > 0
      ? [
          swapDirection === 'BNB_TO_ATK'
            ? parseEther(inputAmount)
            : parseUnits(inputAmount, 18),
          swapDirection === 'BNB_TO_ATK'
            ? [CONTRACTS.WBNB, CONTRACTS.ASSET_TOKEN]
            : [CONTRACTS.ASSET_TOKEN, CONTRACTS.WBNB]
        ]
      : undefined,
  })

  // Update expected output when amountsOut changes
  useEffect(() => {
    if (amountsOut && amountsOut.length > 1) {
      setExpectedOutput(amountsOut[1])
    }
  }, [amountsOut])

  // Approve tokens for router
  const handleApprove = async () => {
    if (!inputAmount) return

    writeContract({
      address: CONTRACTS.ASSET_TOKEN,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.PANCAKE_ROUTER, parseUnits(inputAmount, 18)],
    })
  }

  // Execute swap
  const handleSwap = async () => {
    if (!inputAmount || !address) return

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300) // 5 minutes
    const minOutput = (expectedOutput * BigInt(100 - slippage)) / 100n // Apply slippage

    if (swapDirection === 'BNB_TO_ATK') {
      // Swap BNB for ATK
      writeContract({
        address: CONTRACTS.PANCAKE_ROUTER,
        abi: PANCAKE_ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [
          minOutput,
          [CONTRACTS.WBNB, CONTRACTS.ASSET_TOKEN],
          address,
          deadline,
        ],
        value: parseEther(inputAmount),
      })
    } else {
      // Swap ATK for BNB
      writeContract({
        address: CONTRACTS.PANCAKE_ROUTER,
        abi: PANCAKE_ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [
          parseUnits(inputAmount, 18),
          minOutput,
          [CONTRACTS.ASSET_TOKEN, CONTRACTS.WBNB],
          address,
          deadline,
        ],
      })
    }
  }

  const needsApproval =
    swapDirection === 'ATK_TO_BNB' &&
    inputAmount &&
    allowance !== undefined &&
    allowance < parseUnits(inputAmount, 18)

  if (!isConnected) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <p className="text-center text-gray-600">Please connect your wallet to swap tokens</p>
      </div>
    )
  }

  if (!isKYCVerified) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-red-600 mb-2">KYC Required</h3>
        <p className="text-red-600">Your address is not KYC verified. You must be verified to trade ATK tokens.</p>
        <p className="text-sm text-gray-600 mt-2">Address: {address}</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Swap Tokens</h2>

      {/* Swap Direction Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSwapDirection('BNB_TO_ATK')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            swapDirection === 'BNB_TO_ATK'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          BNB → ATK
        </button>
        <button
          onClick={() => setSwapDirection('ATK_TO_BNB')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            swapDirection === 'ATK_TO_BNB'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          ATK → BNB
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          You Pay
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 p-3 border border-gray-300 rounded-lg"
            step="0.01"
          />
          <span className="font-medium">
            {swapDirection === 'BNB_TO_ATK' ? 'BNB' : 'ATK'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Balance: {swapDirection === 'BNB_TO_ATK'
            ? bnbBalance ? formatEther(bnbBalance.value) : '0'
            : atkBalance ? formatUnits(atkBalance, 18) : '0'
          } {swapDirection === 'BNB_TO_ATK' ? 'BNB' : 'ATK'}
        </p>
      </div>

      {/* Output */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          You Receive (estimated)
        </label>
        <div className="p-3 bg-gray-100 rounded-lg">
          <span className="text-lg font-medium">
            {expectedOutput > 0n
              ? formatUnits(expectedOutput, 18)
              : '0.0'
            } {swapDirection === 'BNB_TO_ATK' ? 'ATK' : 'BNB'}
          </span>
        </div>
      </div>

      {/* Slippage */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slippage Tolerance: {slippage}%
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={slippage}
          onChange={(e) => setSlippage(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? 'Approving...' : 'Approve ATK'}
        </button>
      ) : (
        <button
          onClick={handleSwap}
          disabled={!inputAmount || isPending || isConfirming || parseFloat(inputAmount) <= 0}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? 'Swapping...' : 'Swap'}
        </button>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
          <p className="font-medium">Swap successful!</p>
          <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            View on BscScan
          </a>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-1">Important:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>KYC verification is required</li>
          <li>Minimum output is protected by slippage tolerance</li>
          <li>Price updates automatically</li>
        </ul>
      </div>
    </div>
  )
}
```

---

## Connect Wallet Button

Create `components/ConnectButton.tsx`:

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect with {connector.name}
        </button>
      ))}
    </div>
  )
}
```

---

## Complete Example Page

Create `app/swap/page.tsx`:

```typescript
import ConnectButton from '@/components/ConnectButton'
import TokenSwap from '@/components/TokenSwap'

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Asset Token Exchange
          </h1>
          <ConnectButton />
        </div>

        {/* Swap Component */}
        <TokenSwap />

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-2">ATK Token</h3>
            <p className="text-sm text-gray-600">
              0x3DC23E01d7B7555970823274054047E521290C23
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-2">Liquidity Pool</h3>
            <p className="text-sm text-gray-600">
              0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-2">Network</h3>
            <p className="text-sm text-gray-600">
              BSC Testnet (Chain ID: 97)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
```

---

## KYC Check Hook

Create `hooks/useKYCStatus.ts`:

```typescript
import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS } from '@/contracts/addresses'
import { KYC_REGISTRY_ABI } from '@/contracts/abis'

export function useKYCStatus() {
  const { address } = useAccount()

  const { data: isKYCVerified, isLoading, refetch } = useReadContract({
    address: CONTRACTS.KYC_REGISTRY,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isKYCVerified',
    args: address ? [address] : undefined,
  })

  return {
    isKYCVerified: isKYCVerified ?? false,
    isLoading,
    refetch,
    address,
  }
}
```

---

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
```

---

## Testing

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Connect wallet**:
   - Click "Connect with WalletConnect"
   - Scan QR code with your mobile wallet

3. **Ensure KYC verification**:
   - Your address must be KYC verified
   - Add address using CLI if needed

4. **Test swaps**:
   - Try BNB → ATK swap
   - Try ATK → BNB swap
   - Adjust slippage if needed

---

## Key Features

✅ WalletConnect integration for mobile wallets
✅ Automatic KYC verification check
✅ Real-time price quotes from PancakeSwap
✅ Token approval flow for ATK tokens
✅ Slippage protection
✅ Transaction status tracking
✅ Balance display for both tokens
✅ Responsive design

---

## Security Notes

1. **Always verify addresses** - Double check all contract addresses
2. **Test on testnet first** - Never deploy to mainnet without thorough testing
3. **Check KYC status** - Users must be KYC verified to trade
4. **Use appropriate slippage** - 5-10% recommended for low liquidity
5. **Monitor transactions** - Always check BscScan for confirmation

---

## Troubleshooting

### Error: "User rejected the request"
**Solution**: User cancelled the transaction in their wallet.

### Error: "AssetToken: Caller is not KYC verified"
**Solution**: Add the user's address to KYC registry.

### Error: "Insufficient output amount"
**Solution**: Increase slippage tolerance or reduce swap amount.

### Error: "Transaction reverted"
**Solution**: Check BscScan for specific error. Usually KYC or slippage related.

---

## Additional Resources

- [Wagmi Documentation](https://wagmi.sh)
- [WalletConnect Docs](https://docs.walletconnect.com)
- [PancakeSwap V2 Docs](https://docs.pancakeswap.finance)
- [BSC Testnet Explorer](https://testnet.bscscan.com)

---

## Next Steps

1. Add more trading pairs
2. Implement liquidity provision UI
3. Add price charts
4. Show transaction history
5. Add notifications for completed swaps
6. Implement gas estimation
7. Add wallet balance notifications

Happy coding! 🚀
