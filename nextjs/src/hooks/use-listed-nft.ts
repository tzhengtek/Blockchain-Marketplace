import { useClientQuery } from "./use-client-query";
import { ListedNft } from "@/types/listed-nft";

export const useListedNft = () => {
  return useClientQuery<ListedNft[]>({
    keys: ["listed-nft"],
    url: "api/nft-listed",
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  });
};
