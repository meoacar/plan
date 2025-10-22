import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tek anket detayı
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        options: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Anket bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının oylarını kontrol et
    let userVotes: string[] = [];
    if (session?.user) {
      const votes = await prisma.pollVote.findMany({
        where: {
          pollId: id,
          userId: session.user.id,
        },
        select: { optionId: true },
      });
      userVotes = votes.map((v) => v.optionId);
    }

    return NextResponse.json({ ...poll, userVotes });
  } catch (error) {
    console.error("Poll fetch error:", error);
    return NextResponse.json(
      { error: "Anket yüklenemedi" },
      { status: 500 }
    );
  }
}

// PATCH - Anket güncelle (sadece admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const poll = await prisma.poll.update({
      where: { id },
      data: {
        isActive: body.isActive,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Poll update error:", error);
    return NextResponse.json(
      { error: "Anket güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Anket sil (sadece admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await prisma.poll.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Poll delete error:", error);
    return NextResponse.json(
      { error: "Anket silinemedi" },
      { status: 500 }
    );
  }
}
