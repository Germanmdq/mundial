import { NextResponse } from "next/server";
import { getOfficialLeaderboard } from "@/lib/server/ranking";

export async function GET() {
  try {
    const leaderboard = await getOfficialLeaderboard();
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("[scoring:leaderboard]", error);
    return NextResponse.json({ error: "Could not load leaderboard" }, { status: 500 });
  }
}
