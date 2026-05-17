import { AppShell } from "@/components/layout/AppShell";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export default function CuentaPage() {
  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen pt-14">
        <AccountDashboard />
      </div>
    </AppShell>
  );
}
