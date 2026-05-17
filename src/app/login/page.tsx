import { AuthTabs } from "@/components/auth/AuthTabs";
import { getUser } from "@/lib/auth/getUser";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/cuenta");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-12 flex flex-col">
      <div className="mb-8 text-center px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[#0071e3] text-[13px] font-semibold mb-6 hover:underline">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver a la Home
        </Link>
      </div>
      <div className="flex-1 flex items-start justify-center px-6">
        <AuthTabs />
      </div>
    </div>
  );
}
