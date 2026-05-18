import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyPrivateGroups } from "@/lib/server/private-groups";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await getMyPrivateGroups(user.id);
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("[private-groups:mine]", error);
    return NextResponse.json({ error: "Could not load private groups" }, { status: 500 });
  }
}
