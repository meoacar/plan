import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateStreak } from "@/lib/gamification";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await updateStreak(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Streak update error:", error);
    return NextResponse.json(
      { error: "Streak güncellenemedi" },
      { status: 500 }
    );
  }
}
