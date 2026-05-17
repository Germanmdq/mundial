"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full mt-5 py-3 text-[#ff3b30] text-[14px] font-medium hover:text-[#cc2f26] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
    >
      {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
