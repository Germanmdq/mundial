"use client";

import React from "react";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {showNav && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
