import { Header } from "@/components/atoms/header";
import { AppProviders } from "@/components/providers/app-providers";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tierzeta Dashboard",
  description: "Admin dashboard for managing laws and polls",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders cookies={cookies}>
          <Header projectName="Blockchain" />
          {/* <KYCGuard>{children}</KYCGuard> */}
          <>{children}</>
        </AppProviders>
      </body>
    </html>
  );
}
