"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StickyCTAProps {
  label: string;
  price?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function StickyCTA({ label, price, onClick, disabled }: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-margin-mobile pb-8 pt-4 bg-gradient-to-t from-deep-pitch via-deep-pitch/95 to-transparent">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-full bg-gradient-to-r from-primary-container to-primary h-[56px] rounded-xl flex items-center justify-center gap-4 active:scale-95 transition-all duration-200 ease-out-expo shadow-[0_10px_30px_rgba(212,175,55,0.3)]",
          disabled && "opacity-50 grayscale cursor-not-allowed active:scale-100 shadow-none"
        )}
      >
        <span className="text-on-primary font-bold text-lg">{label}</span>
        {price && (
          <>
            <div className="h-4 w-px bg-on-primary/20" />
            <span className="text-on-primary font-bold text-lg">{price}</span>
          </>
        )}
      </button>
    </div>
  );
}
