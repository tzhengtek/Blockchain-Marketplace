import { useKYC } from "@/hooks/use-kyc";
import { Button } from "./button";
import { useVerifyKYC } from "@/hooks/use-verify-kyc";

export default function KYCComponent({ address }: { address: string }) {
    const {
        data: kyc,
        isLoading,
        isError,
        error,
        refetch,
      } = useKYC(address);

    const { mutate: verifyKYC } = useVerifyKYC(address);

    if (isLoading) {
        return <div>Loading KYC status…</div>;
    }
    console.log("KYCComponent render:", { kyc});
    if (isError) {
        return <div style={{ color: "tomato" }}>
            Failed to reach KYC API{(error as any)?.message ? ` — ${(error as any).message}` : ""}.
        </div>;
    }
    if (!kyc || !kyc.success) {
        return <div style={{ color: "tomato" }}>
            KYC status unavailable.
            <button onClick={() => refetch()} style={{ marginLeft: 8, padding: "4px 8px" }}>Retry</button>
        </div>;
    }
    if (kyc.data == false) {
        return (
            <div>
                <span>KYC not verified</span>
                <Button onClick={() => verifyKYC(address)}>Verify KYC</Button>
            </div>
        );
    }
    return <div>KYC verified</div>;
}