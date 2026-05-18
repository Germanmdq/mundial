"use server";

import { createClient } from "@/lib/supabase/server";

export async function getActivePaidParticipantsCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("user_participation")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (error) {
      console.error("[getActivePaidParticipantsCount] Supabase Error:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("[getActivePaidParticipantsCount] Exception:", err);
    return 0;
  }
}
