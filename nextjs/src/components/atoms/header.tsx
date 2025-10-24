"use client";

import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import ConnectButton from "./connect-button";

interface HeaderProps {
  projectName: string;
}

export function Header({ projectName }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Swap", href: "/swap" },
    { label: "KYC", href: "/kyc" },
    { label: "Transaction", href: "/transaction" },
    { label: "Marketplace", href: "/marketplace" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full  from-[#050510] via-[#0a0e27] to-[#050510] backdrop-blur ">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Project Name */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground hover:text-cyan-300 transition-colors duration-300">
              {projectName}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "transition-all duration-300 font-semibold",
                      !isActive &&
                        "text-muted-foreground hover:text-foreground hover:bg-white/10",
                      isActive &&
                        "bg-gradient-to-r from-primary to-magenta-600 text-white shadow-lg shadow-primary/50"
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Wallet Connect Button - Right side */}
        <div className="flex items-center gap-4">
          <appkit-button />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gradient-to-r from-[#050510]/90 via-[#0a0e27]/90 to-[#050510]/90 border-t border-white/5">
        <div className="container flex gap-2 overflow-x-auto px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all duration-300 font-semibold",
                    !isActive &&
                      "text-muted-foreground hover:text-foreground hover:bg-white/10",
                    isActive &&
                      "bg-gradient-to-r from-primary to-magenta-600 text-white shadow-lg shadow-primary/50"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
