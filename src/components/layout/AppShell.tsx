"use client";

import React from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <Header />
      <main className="flex-1 pb-28 md:pb-0">
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
