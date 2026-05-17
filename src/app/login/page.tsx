import { AuthTabs } from "@/components/auth/AuthTabs";
import { getUser } from "@/lib/auth/getUser";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

type LoginPageProps = {
  searchParams?: Promise<{
    mode?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requestedRedirect = params?.redirect ?? "/mi-prediccion";
  const redirectTo = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/mi-prediccion";
  const mode = params?.mode === "signup" ? "signup" : "login";
  const user = await getUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-5">
        <AuthTabs mode={mode} redirectTo={redirectTo} />
      </div>
    </AppShell>
  );
}
