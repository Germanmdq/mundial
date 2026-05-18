import { NextResponse } from "next/server";
import { getAuthenticatedUser, UnauthorizedError } from "@/lib/server/auth";
import { createMercadoPagoPreference } from "@/lib/server/mercadopago";
import {
  createInternalPendingPayment,
  ensureUserParticipation,
  isParticipationActive,
  markInternalPaymentPending,
  markParticipationPendingPayment,
  PRIZE_PRODUCT_CODE,
} from "@/lib/server/payments";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request, "mercadopago");

    const participation = await ensureUserParticipation(user.id);
    const isActive = isParticipationActive(participation);

    if (isActive) {
      return NextResponse.json({
        alreadyActive: true,
        message: "Tu participación ya está activa.",
      });
    }

    const payment = await createInternalPendingPayment({
      userId: user.id,
      provider: "mercadopago",
      amount: Number(process.env.PRIZE_ENTRY_AMOUNT_ARS || "5000"),
      currency: process.env.PRIZE_ENTRY_CURRENCY_ARS || "ARS",
      productCode: PRIZE_PRODUCT_CODE,
    });

    const preference = await createMercadoPagoPreference({
      userId: user.id,
      paymentId: payment.id,
    });

    await markInternalPaymentPending(payment.id, {
      provider_preference_id: preference.id,
      raw_payload: preference,
    });
    await markParticipationPendingPayment(user.id, "mercadopago", payment.id);

    return NextResponse.json({
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      preference_id: preference.id,
    });
  } catch (error) {
    console.error("[payments:mercadopago:create-preference]", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: error.message,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: "Could not create Mercado Pago preference" }, { status: 500 });
  }
}
