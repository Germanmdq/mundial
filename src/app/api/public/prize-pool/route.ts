import { NextResponse } from "next/server";
import { getDolarBlueRate } from "@/lib/currency/dolar-blue";
import { calculatePrizePool, FALLBACK_DOLAR_BLUE_VENTA } from "@/lib/prize-pool";
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
    const usdBlueRate = blueRate?.venta ?? FALLBACK_DOLAR_BLUE_VENTA;
    const source = blueRate?.venta ? "DolarAPI" : "fallback";

    const pool = calculatePrizePool({
      activeParticipants: activePaidUsersCount,
      dolarBlueVenta: usdBlueRate,
    });

    return NextResponse.json({
      ...pool,
      activePaidUsersCount,
      usdBlueRate,
      source,
      updatedAt: blueRate?.fechaActualizacion ?? new Date().toISOString(),
      blueRate: pool.blueRate,
      blueRateUpdatedAt: blueRate?.fechaActualizacion ?? null,
    });
  } catch (error) {
    console.error("[public:prize-pool]", error);
    const pool = calculatePrizePool({
      activeParticipants: null,
      dolarBlueVenta: FALLBACK_DOLAR_BLUE_VENTA,
    });

    return NextResponse.json({
      ...pool,
      activePaidUsersCount: null,
      usdBlueRate: FALLBACK_DOLAR_BLUE_VENTA,
      source: "fallback",
      updatedAt: new Date().toISOString(),
      blueRate: FALLBACK_DOLAR_BLUE_VENTA,
      blueRateUpdatedAt: null,
    });
  }
}
