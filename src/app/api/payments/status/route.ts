import { NextResponse } from "next/server";
import { getAuthenticatedUser, UnauthorizedError } from "@/lib/server/auth";
import { getLatestPaymentForUser, getParticipationForUser } from "@/lib/server/payments";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request, "status");

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

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: error.message,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: "Could not load payment status" }, { status: 500 });
  }
}
