import { useKYC } from "@/hooks/use-kyc";
import { useVerifyKYC } from "@/hooks/use-verify-kyc";
import { KYCLoading } from "./kyc-loading";
import { KYCError } from "./kyc-error";
import { KYCUnavailable } from "./kyc-unavailable";
import { KYCNotVerified } from "./kyc-not-verified";
import { KYCVerified } from "./kyc-verified";

export const KYCComponent = ({ address }: { address: string }) => {
  const { data: kyc, isLoading, isError, error, refetch } = useKYC(address);
  const { mutate: verifyKYC } = useVerifyKYC();

  if (isLoading) {
    return <KYCLoading />;
  }

  if (isError) {
    return <KYCError error={error} />;
  }

  if (!kyc || !kyc.success) {
    return <KYCUnavailable onRetry={refetch} />;
  }

  if (kyc.data === false) {
    return <KYCNotVerified address={address} onVerify={verifyKYC} />;
  }

  return <KYCVerified />;
};
