import { AppShell } from "@/components/layout/AppShell";
import { getPrizePacks } from "@/lib/worldcup/prizes";
import { getUser } from "@/lib/auth/getUser";
import { PremiosClient } from "@/components/prizes/PremiosClient";

export default async function PremiosPage() {
  const prizes = await getPrizePacks();
  const user = await getUser();

  return (
    <AppShell>
      <PremiosClient initialPrizes={prizes} isLoggedIn={Boolean(user)} />
    </AppShell>
  );
}
