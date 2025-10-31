import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    const feature = await prisma.promoFeature.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Promo feature update error:", error);
    return NextResponse.json(
      { error: "Özellik güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}
