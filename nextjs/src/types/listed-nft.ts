export type ListedNft = {
  seller: string;
  token_id: number;
  nft_contract: string;
  price: number;
};

export type ListedNftResponse = {
  data: ListedNft[];
};
