import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PaymentRequiredError,
  PredictionStageLockedError,
  PredictionValidationError,
  saveOfficialMatchPrediction,
} from "@/lib/server/predictions";

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
    const result = await saveOfficialMatchPrediction(user.id, {
      matchId: body.matchId,
      homeScore: body.homeScore,
      awayScore: body.awayScore,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      return NextResponse.json(
        { error: "payment_required", message: error.message },
        { status: 403 },
      );
    }

    if (error instanceof PredictionStageLockedError) {
      return NextResponse.json(
        { error: "prediction_stage_locked", message: error.message },
        { status: 403 },
      );
    }

    if (error instanceof PredictionValidationError) {
      return NextResponse.json({ error: "invalid_prediction", message: error.message }, { status: 400 });
    }

    console.error("[predictions:save-match]", error);
    return NextResponse.json({ error: "Could not save prediction" }, { status: 500 });
  }
}
