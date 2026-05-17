import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayPalOrder } from "@/lib/server/paypal";
import {
  createInternalPendingPayment,
  ensureUserParticipation,
  markInternalPaymentPending,
  markParticipationPendingPayment,
  PRIZE_PRODUCT_CODE,
} from "@/lib/server/payments";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserParticipation(user.id);

    const payment = await createInternalPendingPayment({
      userId: user.id,
      provider: "paypal",
      amount: Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5"),
      currency: process.env.PRIZE_ENTRY_CURRENCY_USD || "USD",
      productCode: PRIZE_PRODUCT_CODE,
    });

    const order = await createPayPalOrder({
      userId: user.id,
      paymentId: payment.id,
    });

    const approveUrl = order.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;

    await markInternalPaymentPending(payment.id, {
      provider_order_id: order.id,
      raw_payload: order,
    });
    await markParticipationPendingPayment(user.id, "paypal", payment.id);

    return NextResponse.json({
      order_id: order.id,
      approve_url: approveUrl,
    });
  } catch (error) {
    console.error("[payments:paypal:create-order]", error);
    return NextResponse.json({ error: "Could not create PayPal order" }, { status: 500 });
  }
}
