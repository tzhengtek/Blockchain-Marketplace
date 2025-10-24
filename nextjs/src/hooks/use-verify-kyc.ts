import { queryClient } from "@/components/providers/app-providers";
import { useMutation } from "@tanstack/react-query";

export const useVerifyKYC = () => {
  return useMutation({
    mutationFn: async (address: string) => {
      const res = await fetch(`http://localhost:3001/api/kyc?wallet_address=${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      return res.json();
    },
    onSettled: (_data, _error, _variables) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["kyc"] });
      }, 2000);
    },
  });
};
