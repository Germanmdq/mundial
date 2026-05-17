import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/server/paypal";
import {
  activateUserParticipationFromPayment,
  getAppUrl,
  getPaymentById,
  getPaymentByProviderOrderId,
  markInternalPaymentApproved,
  markInternalPaymentRejected,
} from "@/lib/server/payments";

function getCaptureId(captureResponse: Record<string, unknown>) {
  const purchaseUnits = captureResponse.purchase_units as Array<{
    payments?: { captures?: Array<{ id?: string }> };
  }> | undefined;
  return purchaseUnits?.[0]?.payments?.captures?.[0]?.id;
}

function getReferenceId(captureResponse: Record<string, unknown>) {
  const purchaseUnits = captureResponse.purchase_units as Array<{ reference_id?: string }> | undefined;
  return purchaseUnits?.[0]?.reference_id;
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();
  const orderId = request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/pago/error?provider=paypal`);
  }

  try {
    const capture = await capturePayPalOrder(orderId);
    const payment = await getPaymentByProviderOrderId("paypal", orderId);
    const referencePaymentId = getReferenceId(capture);
    const internalPayment = payment || (referencePaymentId ? await getPaymentById(referencePaymentId) : null);

    if (!internalPayment || capture.status !== "COMPLETED") {
      if (internalPayment) {
        await markInternalPaymentRejected(internalPayment.id, "rejected", { raw_payload: capture });
      }
      return NextResponse.redirect(`${appUrl}/pago/error?provider=paypal`);
    }

    const captureId = getCaptureId(capture) || orderId;
    await markInternalPaymentApproved(internalPayment.id, {
      provider_capture_id: captureId,
      provider_payment_id: captureId,
      raw_payload: capture,
      amount: Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5"),
      currency: process.env.PRIZE_ENTRY_CURRENCY_USD || "USD",
    });
    await activateUserParticipationFromPayment({
      userId: internalPayment.user_id,
      provider: "paypal",
      providerReference: captureId,
      amount: Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5"),
      currency: process.env.PRIZE_ENTRY_CURRENCY_USD || "USD",
      paymentId: internalPayment.id,
    });

    return NextResponse.redirect(`${appUrl}/pago/exito?provider=paypal`);
  } catch (error) {
    console.error("[payments:paypal:capture]", error);
    return NextResponse.redirect(`${appUrl}/pago/error?provider=paypal`);
  }
}
