import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestPaymentForUser, getParticipationForUser } from "@/lib/server/payments";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [participation, latestPayment] = await Promise.all([
      getParticipationForUser(user.id),
      getLatestPaymentForUser(user.id),
    ]);

    const participationStatus = participation
      ? {
          status: participation.status,
          paid: participation.paid,
          payment_status: participation.payment_status,
          provider: participation.payment_provider,
          paid_at: participation.paid_at,
        }
      : null;

    return NextResponse.json({
      status: participationStatus?.status ?? "draft",
      paid: participationStatus?.paid ?? false,
      payment_status: participationStatus?.payment_status ?? "unpaid",
      participation: participation
        ? participationStatus
        : null,
      latestPayment,
    });
  } catch (error) {
    console.error("[payments:status]", error);
    return NextResponse.json({ error: "Could not load payment status" }, { status: 500 });
  }
}
