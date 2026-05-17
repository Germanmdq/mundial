import { AppShell } from "@/components/layout/AppShell";
import { PaymentScreen } from "@/components/payment/PaymentScreen";
import { getUser } from "@/lib/auth/getUser";

export default async function PagarPage() {
  const user = await getUser();

  return (
    <AppShell showNav={false}>
      <PaymentScreen userId={user?.id || null} />
    </AppShell>
  );
}
