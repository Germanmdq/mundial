import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const PRIZE_PRODUCT_CODE = "worldcup_prize_entry";

export type PaymentProvider = "mercadopago" | "paypal";
export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded" | "expired";

type PendingPaymentInput = {
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  productCode: string;
};

type ActivatePaymentInput = {
  userId: string;
  provider: PaymentProvider;
  providerReference: string;
  amount: number;
  currency: string;
  paymentId: string | number;
};

type PaymentId = string | number;

function getPaymentIdUpdate(paymentId: PaymentId) {
  const value = String(paymentId);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  return isUuid ? { payment_id: value } : {};
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://mundialentreamigos.online").replace(/\/$/, "");
}

export function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function ensureUserParticipation(userId: string) {
  const supabase = getServiceSupabase();
  const { data: existing, error: selectError } = await supabase
    .from("user_participation")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("user_participation")
    .insert({
      user_id: userId,
      status: "pending_payment",
      paid: false,
      payment_status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createInternalPendingPayment({ userId, provider, amount, currency, productCode }: PendingPaymentInput) {
  const supabase = getServiceSupabase();
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      provider,
      status: "pending",
      amount,
      currency,
      product_code: productCode,
      external_reference: null,
    })
    .select("*")
    .single();

  if (error) throw error;

  const { data: updated, error: updateError } = await supabase
    .from("payments")
    .update({
      external_reference: String(payment.id),
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id)
    .select("*")
    .single();

  if (updateError) throw updateError;
  return updated;
}

export async function markInternalPaymentPending(paymentId: PaymentId, fields: Record<string, unknown> = {}) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...fields,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function markInternalPaymentApproved(paymentId: PaymentId, fields: Record<string, unknown> = {}) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...fields,
      status: "approved",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function markInternalPaymentRejected(paymentId: PaymentId, status: Exclude<PaymentStatus, "pending" | "approved"> = "rejected", fields: Record<string, unknown> = {}) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...fields,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function activateUserParticipationFromPayment({ userId, provider, providerReference, amount, currency, paymentId }: ActivatePaymentInput) {
  const supabase = getServiceSupabase();
  await ensureUserParticipation(userId);

  const { data, error } = await supabase
    .from("user_participation")
    .update({
      status: "active",
      paid: true,
      payment_status: "approved",
      payment_provider: provider,
      payment_reference: providerReference,
      ...getPaymentIdUpdate(paymentId),
      amount,
      currency,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function markParticipationPendingPayment(userId: string, provider: PaymentProvider, paymentId: PaymentId) {
  const supabase = getServiceSupabase();
  await ensureUserParticipation(userId);

  const { data, error } = await supabase
    .from("user_participation")
    .update({
      status: "pending_payment",
      paid: false,
      payment_status: "pending",
      payment_provider: provider,
      ...getPaymentIdUpdate(paymentId),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getPaymentById(paymentId: PaymentId) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPaymentByProviderOrderId(provider: PaymentProvider, providerOrderId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("provider", provider)
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLatestPaymentForUser(userId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getParticipationForUser(userId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("user_participation")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function isUserParticipationActive(userId: string) {
  const participation = await getParticipationForUser(userId);

  return Boolean(
    participation
      && participation.status === "active"
      && participation.paid === true
      && participation.payment_status === "approved",
  );
}
