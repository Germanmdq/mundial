import { NextResponse } from "next/server";

const lockedResponse = {
  error: "special_predictions_locked",
  message: "Campeón y goleador se habilitarán en una segunda etapa.",
};

export async function POST() {
  return NextResponse.json(lockedResponse, { status: 403 });
}
