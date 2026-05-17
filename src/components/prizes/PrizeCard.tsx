"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PrizeCardProps {
  category: string;
  title: string;
  description: string;
  image: string;
  variant?: "small" | "large";
}

export function PrizeCard({ category, title, description, image, variant = "small" }: PrizeCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-titanium-surface/60 backdrop-blur-2xl border border-glass-border flex flex-col justify-end relative overflow-hidden group transition-all duration-500",
        variant === "large" ? "aspect-[16/9]" : "aspect-[3/4]"
      )}
    >
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out-expo"
        />
      </div>
      <div className="relative z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <span className="text-primary font-medium text-[10px] uppercase tracking-widest">
          {category}
        </span>
        <h3 className="text-white font-headline text-xl mt-1">
          {title}
        </h3>
        <p className="text-muted-text text-sm mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
