import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPrivateGroup } from "@/lib/server/private-groups";
import { PaymentRequiredError } from "@/lib/server/predictions";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { group, inviteUrl } = await createPrivateGroup(user.id, String(body.name ?? ""));

    return NextResponse.json({
      ok: true,
      group: {
        id: group.id,
        name: group.name,
        inviteCode: group.invite_code,
        inviteUrl,
      },
    });
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      return NextResponse.json(
        { error: "payment_required", message: error.message },
        { status: 403 },
      );
    }

    console.error("[private-groups:create]", error);
    return NextResponse.json({ error: "Could not create private group" }, { status: 500 });
  }
}
