import { ReactNode } from "react";
import { cn } from "@/utils/cn";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
}: {
  className?: string;
  children: ReactNode;
  showRadialGradient?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative w-full min-h-screen bg-black overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            [background-image:radial-gradient(125%_125%_at_50%_10%,#000_40%,#00d9ff_100%),radial-gradient(125%_125%_at_50%_10%,#3f51b5_0%,#000_40%)]
            absolute -inset-[10px] opacity-60 will-change-transform
            animate-aurora
            `,
            showRadialGradient &&
              "after:absolute after:inset-0 after:[background-image:radial-gradient(circle_at_20%_50%,rgba(63,81,181,0.2)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,217,255,0.2)_0%,transparent_50%)] after:mix-blend-overlay"
          )}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
