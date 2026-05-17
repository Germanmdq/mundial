import React from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageSection({ children, className, ...props }: PageSectionProps) {
  return (
    <div className={cn("py-12 md:py-20", className)} {...props}>
      <div className="w-[min(1180px,87.5vw)] mx-auto">
        {children}
      </div>
    </div>
  );
}
