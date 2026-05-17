import React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function PremiumCard({ children, className, noPadding = false, ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#e5e5e7] rounded-[28px] overflow-hidden",
        "shadow-[0_8px_28px_rgba(0,0,0,0.06)]",
        !noPadding && "p-6 md:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
