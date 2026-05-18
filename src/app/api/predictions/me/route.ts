import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOfficialPrediction, PaymentRequiredError } from "@/lib/server/predictions";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prediction = await getOfficialPrediction(user.id);
    return NextResponse.json(prediction);
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      return NextResponse.json(
        {
          status: "payment_required",
          scores: [],
          completedMatches: 0,
          totalMatches: 72,
          remainingMatches: 72,
          currentStage: "group_stage",
        },
        { status: 403 },
      );
    }

    console.error("[predictions:me]", error);
    return NextResponse.json({ error: "Could not load official prediction" }, { status: 500 });
  }
}
