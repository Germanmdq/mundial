import { getAppUrl } from "./payments";

type CreatePayPalOrderInput = {
  userId: string;
  paymentId: string;
};

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

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal token error: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
}

export async function createPayPalOrder({ userId, paymentId }: CreatePayPalOrderInput) {
  const appUrl = getAppUrl();
  const amount = Number(process.env.PRIZE_ENTRY_AMOUNT_USD || "5").toFixed(2);
  const currency = process.env.PRIZE_ENTRY_CURRENCY_USD || "USD";
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal order error: ${JSON.stringify(data)}`);
  }

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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal capture error: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function verifyPayPalWebhook() {
  return { verified: false, reason: "PayPal webhook signature verification is not configured in this project yet." };
}
