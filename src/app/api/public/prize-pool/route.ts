import { NextResponse } from "next/server";
import { getDolarBlueRate } from "@/lib/currency/dolar-blue";
import { calculatePrizePool } from "@/lib/prize-pool";
import { getServiceSupabase } from "@/lib/server/payments";

async function getActivePaidUsersCount() {
  const supabase = getServiceSupabase();
  const { count, error } = await supabase
    .from("user_participation")
    .select("user_id", { count: "exact", head: true })
    .eq("status", "active")
    .eq("paid", true)
    .eq("payment_status", "approved");

  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    const [activePaidUsersCount, blueRate] = await Promise.all([
      getActivePaidUsersCount(),
      getDolarBlueRate(),
    ]);

    const pool = calculatePrizePool({
      activeParticipants: activePaidUsersCount,
      dolarBlueVenta: blueRate?.venta ?? null,
    });

    return NextResponse.json({
      ...pool,
      activePaidUsersCount,
      blueRate: pool.blueRate,
      blueRateUpdatedAt: blueRate?.fechaActualizacion ?? null,
    });
  } catch (error) {
    console.error("[public:prize-pool]", error);
    const pool = calculatePrizePool({
      activeParticipants: null,
      dolarBlueVenta: null,
    });

    return NextResponse.json({
      ...pool,
      activePaidUsersCount: null,
      blueRate: null,
      blueRateUpdatedAt: null,
    });
  }
}
