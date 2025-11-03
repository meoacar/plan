import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const story = await prisma.userStory.update({
      where: { id },
      data,
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("User story update error:", error);
    return NextResponse.json(
      { error: "Hikaye güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.userStory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User story delete error:", error);
    return NextResponse.json(
      { error: "Hikaye silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
