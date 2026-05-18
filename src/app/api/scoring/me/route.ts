import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateUserScore, getOfficialLeaderboard } from "@/lib/server/scoring";
import { getServiceSupabase } from "@/lib/server/payments";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceSupabase = getServiceSupabase();
    const { data: participation, error } = await serviceSupabase
      .from("user_participation")
      .select("status, paid, payment_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    const isActive = participation?.status === "active"
      && participation.paid === true
      && participation.payment_status === "approved";

    if (!isActive) {
      return NextResponse.json({ status: "payment_required" }, { status: 403 });
    }

    const [summary, leaderboard] = await Promise.all([
      calculateUserScore(user.id),
      getOfficialLeaderboard(),
    ]);
    const ownEntry = leaderboard.find((entry) => entry.user_id === user.id);

    return NextResponse.json({
      ...summary,
      rank_position: ownEntry?.rank_position ?? null,
    });
  } catch (error) {
    console.error("[scoring:me]", error);
    return NextResponse.json({ error: "Could not load score" }, { status: 500 });
  }
}
