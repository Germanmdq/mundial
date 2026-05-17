import { getAppUrl } from "./payments";

type CreatePreferenceInput = {
  userId: string;
  paymentId: string;
};

function getMercadoPagoAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN");
  return token;
}

export async function createMercadoPagoPreference({ userId, paymentId }: CreatePreferenceInput) {
  const appUrl = getAppUrl();
  const amount = Number(process.env.PRIZE_ENTRY_AMOUNT_ARS || "5000");
  const currency = process.env.PRIZE_ENTRY_CURRENCY_ARS || "ARS";

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getMercadoPagoAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: "Participación Mundial entre Amigos 2026",
          description: "Activación de participación oficial para el premio acumulado.",
          quantity: 1,
          unit_price: amount,
          currency_id: currency,
        },
      ],
      external_reference: paymentId,
      metadata: {
        user_id: userId,
        payment_id: paymentId,
        product: "worldcup_prize_entry",
        provider: "mercadopago",
      },
      back_urls: {
        success: `${appUrl}/pago/exito?provider=mercadopago`,
        failure: `${appUrl}/pago/error?provider=mercadopago`,
        pending: `${appUrl}/pago/pendiente?provider=mercadopago`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Mercado Pago preference error: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function getMercadoPagoPayment(providerPaymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${providerPaymentId}`, {
    headers: {
      Authorization: `Bearer ${getMercadoPagoAccessToken()}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Mercado Pago payment error: ${JSON.stringify(data)}`);
  }

  return data;
}
