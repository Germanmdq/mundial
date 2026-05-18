import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PaymentRequiredError,
  PredictionStageLockedError,
  PredictionValidationError,
  syncOfficialPredictionDraft,
} from "@/lib/server/predictions";

interface DraftPredictionItem {
  matchId?: number;
  match_id?: number;
  homeScore?: number;
  home_goals?: number;
  awayScore?: number;
  away_goals?: number;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Accept array or object wrapper
    const draftItems: DraftPredictionItem[] = Array.isArray(body) 
      ? body 
      : (body.scores || body.draft || body.predictions || []);

    const payload = draftItems.map((item: DraftPredictionItem) => {
      const matchId = item.matchId ?? item.match_id;
      const homeVal = item.homeScore ?? item.home_goals;
      const awayVal = item.awayScore ?? item.away_goals;

      return {
        match_id: Number(matchId),
        home_goals: typeof homeVal === "number" ? homeVal : Number(homeVal),
        away_goals: typeof awayVal === "number" ? awayVal : Number(awayVal)
      };
    }).filter((item) => 
      !isNaN(item.match_id) && 
      Number.isInteger(item.home_goals) && 
      Number.isInteger(item.away_goals) &&
      item.home_goals >= 0 && 
      item.away_goals >= 0
    );

    if (payload.length === 0) {
      return NextResponse.json({
        ok: true,
        saved: false,
        completedMatches: 0,
        totalMatches: 72,
        remainingMatches: 72,
        currentStage: "group_stage",
      });
    }

    const result = await syncOfficialPredictionDraft(
      user.id,
      payload.map((item) => ({
        matchId: item.match_id,
        homeScore: item.home_goals,
        awayScore: item.away_goals,
      })),
    );

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

    console.error("[api:predictions:sync-draft]", error);
    return NextResponse.json({ error: "Could not sync draft" }, { status: 500 });
  }
}
