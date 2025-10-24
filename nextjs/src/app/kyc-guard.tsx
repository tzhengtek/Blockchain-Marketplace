// app/kyc-guard.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useKYC } from "@/hooks/use-kyc";
import { useAccount } from "wagmi";


const PUBLIC_PATHS = ["/", "/kyc"];

export function KYCGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { address } = useAccount();

    // If you don’t have an address yet, keep user on home/kyc.
    const isPublic = PUBLIC_PATHS.includes(pathname);

    const { data, isLoading, isError } = useKYC(address ?? "");

    useEffect(() => {
        if (!address) {
          if (!isPublic) router.replace("/"); // or "/kyc"
            return;
        }
        if (isLoading) return;

        const isVerified = data?.data === true; // your KYCResponse shape
        if (!isVerified && !isPublic) {
            router.replace("/kyc");
        }
    }, [address, isLoading, data, isPublic, router, pathname]);

    if (!address && !isPublic) return null;        // or a skeleton
    if (isLoading && !isPublic) return null;       // or a spinner
    if (isError && !isPublic) return null;         // or an error boundary

    return <>{children}</>;
}
