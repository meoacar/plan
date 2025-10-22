import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get("type") || "xp") as "xp" | "likes" | "views";
    const limit = parseInt(searchParams.get("limit") || "10");

    const leaderboard = await getLeaderboard(type, limit);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Liderlik tablosu yüklenemedi" },
      { status: 500 }
    );
  }
}
