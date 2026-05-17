"use client";

import React from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#e5e5e7] p-10 text-center shadow-sm w-full max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4 border border-[#e5e5e7]">
        <span className="material-symbols-outlined text-[#6e6e73] text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      </div>
      <h3 className="font-display font-bold text-[#1d1d1f] text-[18px] mb-2">{title}</h3>
      <p className="text-[#6e6e73] text-[14px] max-w-sm mx-auto">{description}</p>
      
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 bg-[#0071e3] text-white rounded-full font-semibold text-[14px] active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
