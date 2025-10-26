import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAndAwardCheatBadges, getUserCheatBadges } from "@/lib/cheat-meal-badges";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const badges = await getUserCheatBadges(session.user.id);
    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newBadges = await checkAndAwardCheatBadges(session.user.id);
    return NextResponse.json({ newBadges });
  } catch (error) {
    console.error("Error checking badges:", error);
    return NextResponse.json(
      { error: "Failed to check badges" },
      { status: 500 }
    );
  }
}
