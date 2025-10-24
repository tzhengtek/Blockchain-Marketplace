import axios from "axios";

export async function getTransactions({
  hash_address,
  page,
  from_address,
  to_address,
}: {
  hash_address: string;
  page: number;
  from_address: string;
  to_address: string;
}) {
  const params: Record<string, string | number> = {};

  if (hash_address) params.transaction_hash = hash_address;
  if (page !== undefined && page !== null) params.pagination = page;
  if (from_address) params.from = from_address;
  if (to_address) params.to = to_address;

  console.log(params);

  const response = await axios.get(`http://localhost:3000/api/transaction`, {
    params,
  });

  if (response.status !== 200) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  console.log(response.data);
  return response.data;
}

export async function getNft({
  owner,
  page,
}: {
  owner: string;
  page: number;
}) {
  const params: Record<string, string | number> = {};

  if (owner) params.owner = owner;
  if (page !== undefined && page !== null) params.pagination = page;

  const response = await axios.get(`http://localhost:3000/api/nft`, {
    params,
  });

  if (response.status !== 200) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  console.log(response.data);
  return response.data;
}