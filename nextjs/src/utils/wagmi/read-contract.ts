import { useReadContract } from "wagmi";
import { abi } from "./erc20";

const USDTAddress = "0x...";

function App() {
  const result = useReadContract({
    abi: abi,
    address: USDTAddress,
    functionName: "totalSupply",
  });

  return <div>Total Supply: {result.data?.toString()}</div>;
}