import { createClient } from "@/lib/supabase/client";

export async function startMercadoPagoCheckout(
  setLoadingState?: (loading: boolean) => void,
  setErrorState?: (err: string | null) => void
) {
  if (setLoadingState) setLoadingState(true);
  if (setErrorState) setErrorState(null);

  try {
    const headers = await getPaymentAuthHeaders();
    if (!headers) {
      redirectToLoginForPayment();
      return;
    }

    const res = await fetch("/api/payments/mercadopago/create-preference", {
      method: "POST",
      headers
    });

    if (res.status === 401) {
      redirectToLoginForPayment();
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
    const headers = await getPaymentAuthHeaders();
    if (!headers) {
      redirectToLoginForPayment();
      return;
    }

    const res = await fetch("/api/payments/paypal/create-order", {
      method: "POST",
      headers
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      redirectToLoginForPayment();
      return;
    }

    if (!res.ok) {
      console.error("PayPal checkout error", data);
      const details = formatPayPalDetails(data?.details);
      const message = data?.message || details || "No pudimos iniciar PayPal. Probá con Mercado Pago o intentá nuevamente.";
      const debugDetails = shouldShowPaymentDebug()
        ? formatPayPalDebug({ status: res.status, data })
        : "";

      if (setErrorState) {
        setErrorState(
          [
            "No pudimos abrir PayPal.",
            `Detalle: ${message}`,
            debugDetails,
            "También podés pagar con Mercado Pago.",
          ].filter(Boolean).join("\n"),
        );
      }
      return;
    }

    if (data.approve_url) {
      window.location.href = data.approve_url;
    } else {
      console.error("PayPal approve_url missing", data);
      const debugDetails = shouldShowPaymentDebug()
        ? formatPayPalDebug({ status: res.status, data })
        : "";

      if (setErrorState) {
        setErrorState(
          [
            "PayPal no devolvió un enlace de pago. Probá nuevamente.",
            debugDetails,
          ].filter(Boolean).join("\n"),
        );
      }
    }
  } catch (err) {
    console.error("PayPal checkout error:", err);
    if (setErrorState) {
      setErrorState(
        [
          "No pudimos abrir PayPal.",
          `Detalle: ${err instanceof Error ? err.message : "Error desconocido."}`,
          "También podés pagar con Mercado Pago.",
        ].join("\n"),
      );
    }
  } finally {
    if (setLoadingState) setLoadingState(false);
  }
}

function shouldShowPaymentDebug() {
  if (process.env.NODE_ENV !== "production") return true;
  if (typeof window === "undefined") return false;

  return new URLSearchParams(window.location.search).get("debugPayments") === "1";
}

function formatPayPalDetails(details: unknown) {
  if (!details) return "";
  if (typeof details === "string") return details;

  try {
    return JSON.stringify(details);
  } catch {
    return "No se pudo leer el detalle del error.";
  }
}

function formatPayPalDebug({ status, data }: { status: number; data: unknown }) {
  return `Debug PayPal: HTTP ${status} · ${formatPayPalDetails(data)}`;
}

async function getPaymentAuthHeaders() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    try {
      localStorage.setItem("worldcup_payment_intent", JSON.stringify({
        path: window.location.pathname,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage can be unavailable in private modes; login redirect still works.
    }

    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

function redirectToLoginForPayment() {
  window.location.href = `/login?mode=signup&redirect=${encodeURIComponent("/mi-prediccion")}`;
}
