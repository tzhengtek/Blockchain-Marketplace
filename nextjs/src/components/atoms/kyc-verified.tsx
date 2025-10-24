import { KYCVerifiedBadge } from "./kyc-verified-badge";

export function KYCVerified() {
  return (
    <div className="flex flex-col items-center gap-4">
      <KYCVerifiedBadge />
      <p className="text-gray-300 text-center">Your KYC status is verified and active.</p>
    </div>
  );
}
