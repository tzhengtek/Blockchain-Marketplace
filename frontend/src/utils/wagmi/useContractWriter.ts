import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Abi } from "viem";
import { UserRejectedRequestError } from "viem";

type WriteOpts = {
  abi: Abi;
  address: `0x${string}`;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  gas?: bigint;
};

export function useContractWriter() {
  const { writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const tx = useWaitForTransactionReceipt({ hash: txHash });

  const call = async (opts: WriteOpts) => {
    try {
      // Default gas limit for manual contracts like pair.swap()
      const gasLimit = opts.gas ?? 300000n; // around 0.0003 BNB max

      const hash = await writeContractAsync({
        abi: opts.abi,
        address: opts.address,
        functionName: opts.functionName as any,
        args: opts.args as any,
        value: opts.value,
        gas: gasLimit, // force a predictable gas limit
      });

      return hash;
    } catch (err: any) {
      if (err instanceof UserRejectedRequestError || err?.code === 4001) {
        const friendly = new Error("Transaction cancelled by user");
        (friendly as any).userRejected = true;
        throw friendly;
      }
      throw err;
    }
  };

  return {
    call,
    txHash,
    isPending,
    isMining: tx.isLoading,
    isConfirmed: tx.isSuccess,
    error,
  };
}
