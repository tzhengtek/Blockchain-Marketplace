import { Button } from "./button";
import { KYCUnverifiedBadge } from "./kyc-unverified-badge";

interface KYCNotVerifiedProps {
  address: string;
  onVerify: (address: string) => void;
}

export function KYCNotVerified({ address, onVerify }: KYCNotVerifiedProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <KYCUnverifiedBadge />
      <p className="text-gray-300 text-center">Your KYC status is not verified. Please verify your identity to continue.</p>
      <Button onClick={() => onVerify(address)}>Verify KYC</Button>
    </div>
  );
}
