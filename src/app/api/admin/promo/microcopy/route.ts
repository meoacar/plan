import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    const where = location ? { location } : {};

    const microcopies = await prisma.microCopy.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(microcopies);
  } catch (error) {
    console.error("Micro copy fetch error:", error);
    return NextResponse.json(
      { error: "Mikro kopyalar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    const microcopy = await prisma.microCopy.create({
      data: {
        key: data.key,
        location: data.location,
        text: data.text,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(microcopy);
  } catch (error) {
    console.error("Micro copy create error:", error);
    return NextResponse.json(
      { error: "Mikro kopy oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
