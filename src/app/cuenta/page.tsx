import { AppShell } from "@/components/layout/AppShell";
import { AccountDashboardClient } from "@/components/account/AccountDashboardClient";
import { getUser } from "@/lib/auth/getUser";
import { getAccountDashboard } from "@/lib/worldcup/account";

export default async function CuentaPage() {
  const user = await getUser();
  let session = null;
  let ranking = null;

  if (user) {
    const data = await getAccountDashboard(user.id);
    session = data.session;
    ranking = data.ranking;
  }

  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen pt-14">
        <AccountDashboardClient 
          initialUser={user ? { id: user.id, email: user.email, user_metadata: user.user_metadata } : null} 
          initialSession={session}
          initialRanking={ranking}
        />
      </div>
    </AppShell>
  );
}
