import React from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref
}: PageHeroProps) {
  return (
    <section 
      className="pt-24 pb-14 text-center border-b border-[#e5e5e7]/50"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(0,113,227,0.06), transparent 50%), #f5f5f7"
      }}
    >
      <div className="w-[min(1180px,87.5vw)] mx-auto px-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <span className="mb-3 block text-[13px] font-bold uppercase tracking-[0.15em] text-[#0071e3]">
            {eyebrow}
          </span>
          <h1 className="font-display font-extrabold text-[#1d1d1f] text-[clamp(44px,6vw,76px)] leading-[1.05] tracking-[-0.045em]">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-[720px] text-[21px] leading-[1.4] font-medium text-[#6e6e73]">
            {description}
          </p>
          
          {(actionLabel || secondaryLabel) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {actionLabel && actionHref && (
                <PremiumButton href={actionHref} variant="primary">
                  {actionLabel}
                </PremiumButton>
              )}
              {secondaryLabel && secondaryHref && (
                <PremiumButton href={secondaryHref} variant="secondary">
                  {secondaryLabel}
                </PremiumButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
