"use client";

import { ReactNode, useState } from "react";

type SafeAssetImageProps = {
  src: string | string[] | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
};

export function SafeAssetImage({ src, alt, className, fallback }: SafeAssetImageProps) {
  const sources = Array.isArray(src) ? src.filter(Boolean) : src ? [src] : [];
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSource = sources[sourceIndex] ?? null;

  if (!currentSource) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={currentSource}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  );
}
