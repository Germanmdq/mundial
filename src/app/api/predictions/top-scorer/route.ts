import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "special_predictions_locked",
      message: "Campeón y goleador se habilitarán en una segunda etapa.",
    },
    { status: 403 },
  );
}
