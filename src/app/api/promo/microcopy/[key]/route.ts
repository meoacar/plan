import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const microcopy = await prisma.microCopy.findFirst({
      where: {
        key: params.key,
        isActive: true,
      },
    });

    if (!microcopy) {
      return NextResponse.json(
        { error: "Mikro kopy bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(microcopy);
  } catch (error) {
    console.error("Micro copy fetch error:", error);
    return NextResponse.json(
      { error: "Mikro kopy yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
