import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const microcopies = await prisma.microCopy.findMany({
      orderBy: [{ location: "asc" }, { key: "asc" }],
    });

    return NextResponse.json(microcopies);
  } catch (error) {
    console.error("Microcopy fetch error:", error);
    return NextResponse.json(
      { error: "Mikro kopyalar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
