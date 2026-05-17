export async function startMercadoPagoCheckout(
  setLoadingState?: (loading: boolean) => void,
  setErrorState?: (err: string | null) => void
) {
  if (setLoadingState) setLoadingState(true);
  if (setErrorState) setErrorState(null);

  try {
    const res = await fetch("/api/payments/mercadopago/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (res.status === 401) {
      window.location.href = `/login?mode=signup&redirect=${encodeURIComponent("/mi-prediccion")}`;
      return;
    }

    if (!res.ok) throw new Error("Status " + res.status);
    
    const data = await res.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      throw new Error("No init_point returned");
    }
  } catch (err) {
    console.error("Mercado Pago checkout error:", err);
    if (setErrorState) setErrorState("No pudimos iniciar el pago. Probá de nuevo.");
  } finally {
    if (setLoadingState) setLoadingState(false);
  }
}

export async function startPayPalCheckout(
  setLoadingState?: (loading: boolean) => void,
  setErrorState?: (err: string | null) => void
) {
  if (setLoadingState) setLoadingState(true);
  if (setErrorState) setErrorState(null);

  try {
    const res = await fetch("/api/payments/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (res.status === 401) {
      window.location.href = `/login?mode=signup&redirect=${encodeURIComponent("/mi-prediccion")}`;
      return;
    }

    if (!res.ok) throw new Error("Status " + res.status);

    const data = await res.json();
    if (data.approve_url) {
      window.location.href = data.approve_url;
    } else {
      throw new Error("No approve_url returned");
    }
  } catch (err) {
    console.error("PayPal checkout error:", err);
    if (setErrorState) setErrorState("No pudimos iniciar el pago. Probá de nuevo.");
  } finally {
    if (setLoadingState) setLoadingState(false);
  }
}
