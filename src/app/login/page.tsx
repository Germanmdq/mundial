import { AuthTabs } from "@/components/auth/AuthTabs";
import { getUser } from "@/lib/auth/getUser";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/cuenta");
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-5">
        <AuthTabs />
      </div>
    </AppShell>
  );
}
