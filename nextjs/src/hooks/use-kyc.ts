import { useClientQuery } from "./use-client-query";

export type KYCResponse = {
  data: boolean;
  success: boolean;
};

export const useKYC = (address: string) => {
  return useClientQuery<KYCResponse>({
    keys: ["kyc", address],
    url: `api/kyc?wallet_address=${address}`,
  });
};
