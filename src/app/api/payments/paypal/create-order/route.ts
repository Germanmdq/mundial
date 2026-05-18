import { NextResponse } from "next/server";
import { getAuthenticatedUser, UnauthorizedError } from "@/lib/server/auth";
import { createPayPalOrder, PayPalApiError } from "@/lib/server/paypal";
import {
  createInternalPendingPayment,
  ensureUserParticipation,
  isParticipationActive,
  canStartPaymentFromParticipation,
  markInternalPaymentPending,
  markParticipationPendingPayment,
  PRIZE_PRODUCT_CODE,
} from "@/lib/server/payments";

type PayPalOrderResponse = {
  id?: string;
  links?: Array<{ rel: string; href: string }>;
};

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  console.info("[paypal:create-order:start]", {
    requestId,
    method: request.method,
    url: request.url,
    hasAuthorization: Boolean(request.headers.get("authorization")),
    userAgent: request.headers.get("user-agent"),
  });

  try {
    const user = await getAuthenticatedUser(request, "paypal");

    console.info("[paypal:create-order:auth]", {
      requestId,
      userFound: Boolean(user),
      userId: user?.id ?? null,
      email: user?.email ?? null,
    });

    const participation = await ensureUserParticipation(user.id);
    const isActive = isParticipationActive(participation);
    const canStartPayment = canStartPaymentFromParticipation(participation);

    console.info("[paypal:create-order:participation]", {
      requestId,
      userId: user.id,
      status: participation?.status ?? null,
      paid: participation?.paid ?? null,
      paymentStatus: participation?.payment_status ?? null,
      isActive,
      canStartPayment,
    });

    if (isActive) {
      return NextResponse.json({
        alreadyActive: true,
        message: "Tu participación ya está activa.",
        requestId,
      });
    }

    const payment = await createInternalPendingPayment({
      userId: user.id,
      provider: "paypal",
      amount: Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5"),
      currency: process.env.PRIZE_ENTRY_CURRENCY_USD || "USD",
      productCode: PRIZE_PRODUCT_CODE,
    });

    console.info("[paypal:create-order:payment-created]", {
      requestId,
      paymentId: payment.id,
      provider: payment.provider,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    });

    console.info("[paypal:create-order:paypal-request]", {
      requestId,
      env: process.env.PAYPAL_ENV ?? null,
      hasClientId: Boolean(process.env.PAYPAL_CLIENT_ID),
      hasClientSecret: Boolean(process.env.PAYPAL_CLIENT_SECRET),
      amount: Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5"),
      currency: process.env.PRIZE_ENTRY_CURRENCY_USD || "USD",
    });

    const order = await createPayPalOrder({
      userId: user.id,
      paymentId: payment.id,
    }) as PayPalOrderResponse;

    const approveUrl = order.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;

    console.info("[paypal:create-order:success]", {
      requestId,
      orderId: order.id ?? null,
      hasApproveUrl: Boolean(approveUrl),
      approveHost: approveUrl ? new URL(approveUrl).host : null,
    });

    if (!order.id || !approveUrl) {
      return NextResponse.json(
        {
          error: "paypal_create_order_failed",
          message: "PayPal did not return an approval URL.",
          requestId,
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
      requestId,
    });
  } catch (error) {
    console.error("[payments:paypal:create-order]", error);
    console.error("[paypal:create-order:error]", {
      requestId,
      name: error instanceof Error ? error.name : null,
      message: error instanceof Error ? error.message : String(error),
      status: error instanceof PayPalApiError ? error.status : null,
      details: error instanceof PayPalApiError ? error.details : null,
    });

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: error.message,
          requestId,
        },
        { status: 401 },
      );
    }

    if (error instanceof PayPalApiError) {
      return NextResponse.json(
        {
          error: "paypal_create_order_failed",
          message: error.message,
          details: error.details,
          requestId,
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
        requestId,
      },
      { status: 500 },
    );
  }
}
