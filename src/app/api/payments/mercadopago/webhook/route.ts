import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoPayment } from "@/lib/server/mercadopago";
import {
  activateUserParticipationFromPayment,
  getPaymentById,
  markInternalPaymentApproved,
  markInternalPaymentPending,
  markInternalPaymentRejected,
  markParticipationPendingPayment,
} from "@/lib/server/payments";

function readMercadoPagoPaymentId(request: NextRequest, payload: Record<string, unknown>) {
  const url = new URL(request.url);
  const queryDataId = url.searchParams.get("data.id");
  const queryId = url.searchParams.get("id");
  const queryTopic = url.searchParams.get("topic") || url.searchParams.get("type");
  const data = payload.data as { id?: string | number } | undefined;

  if (queryDataId) return queryDataId;
  if (data?.id) return String(data.id);
  if (queryTopic === "payment" && queryId) return queryId;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const type = payload.type || payload.action || new URL(request.url).searchParams.get("type");
    const providerPaymentId = readMercadoPagoPaymentId(request, payload);

    if (!providerPaymentId || (type && typeof type === "string" && !type.includes("payment"))) {
      return NextResponse.json({ received: true });
    }

    const providerPayment = await getMercadoPagoPayment(providerPaymentId);
    const paymentId = providerPayment.external_reference || providerPayment.metadata?.payment_id;

    if (!paymentId) {
      console.warn("[payments:mercadopago:webhook] missing internal payment reference", providerPaymentId);
      return NextResponse.json({ received: true });
    }

    const internalPayment = await getPaymentById(String(paymentId));
    if (!internalPayment) {
      console.warn("[payments:mercadopago:webhook] internal payment not found", paymentId);
      return NextResponse.json({ received: true });
    }

    const status = providerPayment.status as string;
    const amount = Number(providerPayment.transaction_amount || internalPayment.amount || 5000);
    const currency = providerPayment.currency_id || internalPayment.currency || "ARS";

    if (status === "approved") {
      await markInternalPaymentApproved(internalPayment.id, {
        provider_payment_id: String(providerPayment.id),
        raw_payload: providerPayment,
        amount,
        currency,
      });
      await activateUserParticipationFromPayment({
        userId: internalPayment.user_id,
        provider: "mercadopago",
        providerReference: String(providerPayment.id),
        amount,
        currency,
        paymentId: internalPayment.id,
      });
    } else if (status === "pending" || status === "in_process") {
      await markInternalPaymentPending(internalPayment.id, {
        provider_payment_id: String(providerPayment.id),
        raw_payload: providerPayment,
      });
      await markParticipationPendingPayment(internalPayment.user_id, "mercadopago", internalPayment.id);
    } else if (["rejected", "cancelled", "refunded", "expired"].includes(status)) {
      await markInternalPaymentRejected(internalPayment.id, status as "rejected" | "cancelled" | "refunded" | "expired", {
        provider_payment_id: String(providerPayment.id),
        raw_payload: providerPayment,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payments:mercadopago:webhook]", error);
    return NextResponse.json({ received: true });
  }
}
