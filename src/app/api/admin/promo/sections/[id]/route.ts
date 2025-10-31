import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const section = await prisma.promoSection.findUnique({
      where: { id: params.id },
    });

    if (!section) {
      return NextResponse.json({ error: "Bölüm bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Promo section fetch error:", error);
    return NextResponse.json(
      { error: "Bölüm yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

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

    const section = await prisma.promoSection.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Promo section update error:", error);
    return NextResponse.json(
      { error: "Bölüm güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    await prisma.promoSection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Promo section delete error:", error);
    return NextResponse.json(
      { error: "Bölüm silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
