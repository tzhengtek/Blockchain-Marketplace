// TestApprove.tsx
import { useAccount, useSwitchChain, useReadContract } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { parseUnits, type Abi } from 'viem'
import { useContractWriter } from '../../utils/wagmi/useContractWriter'
import { ASSET_TOKEN_ADDRESS, PANCAKE_ROUTER_ADDRESS } from '../../utils/wagmi/address'

// ERC20 minimal
const erc20Abi = [
  { type:'function', name:'decimals', stateMutability:'view', inputs:[], outputs:[{type:'uint8'}] },
  { type:'function', name:'approve',  stateMutability:'nonpayable',
    inputs:[{name:'spender',type:'address'},{name:'amount',type:'uint256'}], outputs:[{type:'bool'}] },
] as const satisfies Abi

export function TestApprove() {
  const { address, chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { call, txHash, isPending, isMining, isConfirmed, error } = useContractWriter()

  const { data: decimals } = useReadContract({
    abi: erc20Abi, address: ASSET_TOKEN_ADDRESS, functionName: 'decimals'
  })

  const onApprove = async () => {
    const dec = Number(decimals ?? 18)
    const amount = parseUnits('1000', dec)
    await call({
      abi: erc20Abi as unknown as Abi,
      address: ASSET_TOKEN_ADDRESS,
      functionName: 'approve',
      args: [PANCAKE_ROUTER_ADDRESS, amount],
    })
  }

  if (!isConnected) return <p className="text-sm">Connecte ton wallet.</p>
  if (chain?.id !== bscTestnet.id) {
    return <button onClick={() => switchChain({ chainId: bscTestnet.id })} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Basculer sur BSC Testnet</button>
  }

  return (
    <div className="space-y-3">
      <button onClick={onApprove} disabled={isPending || isMining} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {isPending ? 'Signer…' : isMining ? 'Mining…' : 'Approve 1000 ASSET → Router'}
      </button>
      {txHash && <p className="text-sm">tx: {txHash}</p>}
      {isConfirmed && <p className="text-sm">✅ Confirmed</p>}
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
