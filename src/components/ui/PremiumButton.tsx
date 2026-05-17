import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function PremiumButton({ children, className, href, variant = "primary", ...props }: PremiumButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full h-11 px-6 font-semibold text-[15px] transition-all active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#0071e3] text-white hover:bg-[#0066cc]",
    secondary: "bg-white text-[#1d1d1f] border border-[rgba(0,0,0,0.08)] shadow-sm hover:bg-[#f5f5f7]",
    outline: "bg-transparent text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3] hover:text-white"
  };

  const combinedClasses = cn(baseStyles, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
