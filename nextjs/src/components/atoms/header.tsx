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
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Project Name */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {projectName}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "transition-colors",
                      isActive && "bg-primary text-primary-foreground"
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
      <div className="md:hidden border-t border-border bg-background/50">
        <div className="container flex gap-1 overflow-x-auto px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-colors",
                    isActive && "bg-primary text-primary-foreground"
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
