export type Nft = {
  owner: string;
  token_id: string | undefined;
  contract_address: string;
};

export type NftResponse = {
  nfts: Nft[];
  total: number;
};
