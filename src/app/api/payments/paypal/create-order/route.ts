import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayPalOrder, PayPalApiError } from "@/lib/server/paypal";
import {
  createInternalPendingPayment,
  ensureUserParticipation,
  markInternalPaymentPending,
  markParticipationPendingPayment,
  PRIZE_PRODUCT_CODE,
} from "@/lib/server/payments";

type PayPalOrderResponse = {
  id?: string;
  links?: Array<{ rel: string; href: string }>;
};

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
    }) as PayPalOrderResponse;

    const approveUrl = order.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;

    if (!order.id || !approveUrl) {
      return NextResponse.json(
        {
          error: "paypal_create_order_failed",
          message: "PayPal did not return an approval URL.",
          details: {
            orderId: order.id ?? null,
            links: order.links?.map((link) => ({ rel: link.rel, href: link.href })) ?? [],
          },
        },
        { status: 502 },
      );
    }

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

    if (error instanceof PayPalApiError) {
      return NextResponse.json(
        {
          error: "paypal_create_order_failed",
          message: error.message,
          details: error.details,
        },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    const message = error instanceof Error ? error.message : "Could not create PayPal order";
    return NextResponse.json(
      {
        error: "paypal_create_order_failed",
        message,
        details: null,
      },
      { status: 500 },
    );
  }
}
