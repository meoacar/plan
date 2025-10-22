import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const voteSchema = z.object({
  optionIds: z.array(z.string()).min(1),
});

// POST - Oy ver
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { id: pollId } = await params;
    const body = await req.json();
    const { optionIds } = voteSchema.parse(body);

    // Anket kontrolü
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Anket bulunamadı" },
        { status: 404 }
      );
    }

    if (!poll.isActive) {
      return NextResponse.json(
        { error: "Anket aktif değil" },
        { status: 400 }
      );
    }

    if (poll.endsAt && poll.endsAt < new Date()) {
      return NextResponse.json(
        { error: "Anket süresi dolmuş" },
        { status: 400 }
      );
    }

    // Çoklu seçim kontrolü
    if (!poll.allowMultiple && optionIds.length > 1) {
      return NextResponse.json(
        { error: "Bu ankette sadece bir seçenek seçebilirsiniz" },
        { status: 400 }
      );
    }

    // Seçeneklerin geçerliliğini kontrol et
    const validOptionIds = poll.options.map((o) => o.id);
    const invalidOptions = optionIds.filter((id) => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { error: "Geçersiz seçenek" },
        { status: 400 }
      );
    }

    // Önceki oyları sil
    await prisma.pollVote.deleteMany({
      where: {
        pollId,
        userId: session.user.id,
      },
    });

    // Yeni oyları ekle
    await prisma.pollVote.createMany({
      data: optionIds.map((optionId) => ({
        pollId,
        optionId,
        userId: session.user.id,
      })),
    });

    // Güncel sonuçları getir
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
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

    return NextResponse.json(updatedPoll);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri" },
        { status: 400 }
      );
    }
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Oy kullanılamadı" },
      { status: 500 }
    );
  }
}
