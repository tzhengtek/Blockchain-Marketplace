import { useAccount } from 'wagmi'
import { parseUnits, type Abi } from 'viem'
import { useContractWriter } from '../../utils/wagmi/useContractWriter'
import { PANCAKE_ROUTER_ADDRESS, ASSET_TOKEN_ADDRESS, WBNB_ADDRESS } from '../../utils/wagmi/address'

const routerV2Abi = [
  { type:'function', name:'swapExactTokensForTokens', stateMutability:'nonpayable',
    inputs:[
      {name:'amountIn',type:'uint256'},
      {name:'amountOutMin',type:'uint256'},
      {name:'path',type:'address[]'},
      {name:'to',type:'address'},
      {name:'deadline',type:'uint256'}
    ],
    outputs:[{type:'uint256[]'}]
  },
] as const satisfies Abi

export function SwapAssetToWbnb() {
  const { address, isConnected } = useAccount()
  const { call, isPending, isMining, isConfirmed, txHash, error } = useContractWriter()

  const onSwap = async () => {
    if (!address) return
    const amountIn = parseUnits('10', 18)
    const amountOutMin = 0n

    await call({
      abi: routerV2Abi as unknown as Abi,
      address: PANCAKE_ROUTER_ADDRESS,
      functionName: 'swapExactTokensForTokens',
      args: [
        amountIn,
        amountOutMin,
        [ASSET_TOKEN_ADDRESS, WBNB_ADDRESS], // path
        address,
        BigInt(Math.floor(Date.now() / 1000) + 600), // +10min
      ],
    })
  }

  if (!isConnected) return <p>Connecte ton wallet.</p>

  return (
    <div>
      <button onClick={onSwap} disabled={isPending || isMining}>
        {isPending ? 'Signer…' : isMining ? 'Swap en cours…' : 'Swap 10 ASSET → WBNB'}
      </button>
      {txHash && <p>tx: {txHash}</p>}
      {isConfirmed && <p>✅ Confirmed</p>}
      {error && <p style={{ color:'tomato' }}>{error.message}</p>}
    </div>
  )
}
