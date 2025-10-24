import { useQuery } from "@tanstack/react-query";
import { NftResponse } from "@/types/nft";

interface GetNftParams {
  owner?: string;
  page?: number;
}

export const useNft = (params: GetNftParams) => {
  return useQuery<NftResponse>({
    queryKey: ["nft", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params.owner) queryParams.set("owner", params.owner);
      if (params.page !== undefined && params.page !== null) queryParams.set("pagination", params.page.toString());

      const response = await fetch(`/api/nft?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
