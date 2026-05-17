import { NextRequest, NextResponse } from "next/server";
import {
  activateUserParticipationFromPayment,
  getPaymentByProviderOrderId,
  markInternalPaymentApproved,
  markInternalPaymentRejected,
} from "@/lib/server/payments";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    const eventType = event.event_type as string | undefined;

    if (!eventType) return NextResponse.json({ received: true });

    const resource = event.resource || {};
    const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
    const captureId = resource.id;
    const payment = orderId ? await getPaymentByProviderOrderId("paypal", orderId) : null;

    if (!payment) return NextResponse.json({ received: true });

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      await markInternalPaymentApproved(payment.id, {
        provider_capture_id: captureId,
        provider_payment_id: captureId,
        raw_payload: event,
      });
      await activateUserParticipationFromPayment({
        userId: payment.user_id,
        provider: "paypal",
        providerReference: captureId,
        amount: Number(payment.amount || process.env.PRIZE_ENTRY_AMOUNT_USD || "5"),
        currency: payment.currency || process.env.PRIZE_ENTRY_CURRENCY_USD || "USD",
        paymentId: payment.id,
      });
    } else if (eventType === "PAYMENT.CAPTURE.DENIED") {
      await markInternalPaymentRejected(payment.id, "rejected", { raw_payload: event });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payments:paypal:webhook]", error);
    return NextResponse.json({ received: true });
  }
}
