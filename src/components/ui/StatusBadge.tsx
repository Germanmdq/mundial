import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "gray" | "gold" | "red";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: string;
}

export function StatusBadge({ children, variant = "gray", className, icon }: StatusBadgeProps) {
  const variants = {
    blue: "bg-[#e8f0fd] text-[#0071e3]",
    gray: "bg-[#f5f5f7] text-[#6e6e73]",
    gold: "bg-[#f7f0e0] text-[#b5862a]",
    red: "bg-[#fceced] text-[#ff3b30]"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em]",
      variants[variant],
      className
    )}>
      {icon && (
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
