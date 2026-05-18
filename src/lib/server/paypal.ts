import { getAppUrl } from "./payments";

type CreatePayPalOrderInput = {
  userId: string;
  paymentId: string;
};

export class PayPalApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "PayPalApiError";
    this.status = status;
    this.details = details;
  }
}

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

async function readPayPalResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 500);
  }
}

function getPayPalErrorMessage(prefix: string, details: unknown) {
  if (details && typeof details === "object") {
    const data = details as {
      name?: string;
      message?: string;
      error?: string;
      error_description?: string;
    };

    return data.message || data.error_description || data.error || data.name || prefix;
  }

  if (typeof details === "string" && details.trim()) {
    return details;
  }

  return prefix;
}

export async function getPayPalAccessToken() {
  const baseUrl = getPayPalBaseUrl();
  const { clientId, clientSecret } = getPayPalCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  console.info("[paypal:token:start]", {
    env: process.env.PAYPAL_ENV ?? null,
    baseUrl,
    hasClientId: Boolean(process.env.PAYPAL_CLIENT_ID),
    hasClientSecret: Boolean(process.env.PAYPAL_CLIENT_SECRET),
  });

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await readPayPalResponse(response);
  console.info("[paypal:token:response]", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    console.error("[paypal:token:error]", {
      status: response.status,
      body: data,
    });

    throw new PayPalApiError(
      getPayPalErrorMessage("PayPal token error", data),
      response.status,
      data,
    );
  }

  if (!data || typeof data !== "object" || !("access_token" in data)) {
    throw new PayPalApiError("PayPal token response did not include access_token", response.status, data);
  }

  console.info("[paypal:token:success]", {
    tokenReceived: Boolean(data.access_token),
  });

  return data.access_token as string;
}

export async function createPayPalOrder({ userId, paymentId }: CreatePayPalOrderInput) {
  const baseUrl = getPayPalBaseUrl();
  const appUrl = getAppUrl();
  const amount = Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5").toFixed(2);
  const currency = process.env.PRIZE_ENTRY_CURRENCY_USD || "USD";
  const accessToken = await getPayPalAccessToken();

  console.info("[paypal:order:start]", {
    env: process.env.PAYPAL_ENV ?? null,
    baseUrl,
    amount,
    currency,
  });

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: paymentId,
          description: "Participación Mundial entre Amigos 2026",
          custom_id: userId,
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
      application_context: {
        brand_name: "Mundial entre Amigos",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${appUrl}/api/payments/paypal/capture`,
        cancel_url: `${appUrl}/pago/error?provider=paypal`,
      },
    }),
  });

  const data = await readPayPalResponse(response);
  console.info("[paypal:order:response]", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    console.error("[paypal:order:error]", {
      status: response.status,
      body: data,
    });

    throw new PayPalApiError(
      getPayPalErrorMessage("PayPal order error", data),
      response.status,
      data,
    );
  }

  const approveUrl = data && typeof data === "object" && "links" in data && Array.isArray(data.links)
    ? data.links.find((link: { rel?: string }) => link.rel === "approve")?.href
    : null;

  console.info("[paypal:order:links]", {
    orderId: data && typeof data === "object" && "id" in data ? data.id : null,
    links: data && typeof data === "object" && "links" in data && Array.isArray(data.links)
      ? data.links.map((link: { rel?: string; method?: string; href?: string }) => ({
          rel: link.rel,
          method: link.method,
          hrefHost: link.href ? new URL(link.href).host : null,
        }))
      : [],
    hasApproveUrl: Boolean(approveUrl),
  });

  return data;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await readPayPalResponse(response);
  if (!response.ok) {
    throw new PayPalApiError(
      getPayPalErrorMessage("PayPal capture error", data),
      response.status,
      data,
    );
  }

  return data;
}

export async function verifyPayPalWebhook() {
  return { verified: false, reason: "PayPal webhook signature verification is not configured in this project yet." };
}
