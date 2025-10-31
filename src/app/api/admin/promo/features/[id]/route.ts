import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
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
