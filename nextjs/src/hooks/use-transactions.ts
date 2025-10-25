import { useQuery } from "@tanstack/react-query";
import { TransactionsResponse } from "@/types/transaction";

interface GetTransactionsParams {
  hash_address?: string;
  page?: number;
  from_address?: string;
  to_address?: string;
}

export const useTransactions = (params: GetTransactionsParams) => {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params.hash_address) queryParams.set("transaction_hash", params.hash_address);
      if (params.page !== undefined && params.page !== null) queryParams.set("pagination", params.page.toString());
      if (params.from_address) queryParams.set("from", params.from_address);
      if (params.to_address) queryParams.set("to", params.to_address);

      const response = await fetch(`/api/transaction?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
