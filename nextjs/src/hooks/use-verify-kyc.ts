import { queryClient } from "@/components/providers/app-providers";
import { useMutation } from "@tanstack/react-query";

export const useVerifyKYC = () => {
  return useMutation({
    mutationFn: async (address: string) => {
      const res = await fetch(`/api/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      return res.json();
    },
    onSuccess: (_data, address) => {
      // Invalidate only the specific address query after 2 seconds
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["kyc", address] });
      }, 2000);
    },
  });
};
