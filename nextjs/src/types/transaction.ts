export type Transaction = {
  transaction_hash: string;
  from_address: string;
  to_address: string;
  timestamp: string;
  value: string | number;
  block_id: number;
  contract_address?: string | null;
};

export type TransactionsResponse = {
  transactions: Transaction[];
  total: number;
};
