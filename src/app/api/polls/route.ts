import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPollSchema = z.object({
    question: z.string().min(5).max(200),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(true),
    allowMultiple: z.boolean().default(false),
    endsAt: z.string().datetime().optional(),
    options: z.array(z.string().min(1).max(100)).min(2).max(10),
});

// GET - Anketleri listele
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const active = searchParams.get("active");
        const limit = parseInt(searchParams.get("limit") || "10");

        const where: any = {};
        if (active === "true") {
            where.isActive = true;
            where.OR = [
                { endsAt: null },
                { endsAt: { gt: new Date() } }
            ];
        }

        const polls = await prisma.poll.findMany({
            where,
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
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json(polls);
    } catch (error) {
        console.error("Poll fetch error:", error);
        return NextResponse.json(
            { error: "Anketler yüklenemedi" },
            { status: 500 }
        );
    }
}

// POST - Yeni anket oluştur (tüm kullanıcılar)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const data = createPollSchema.parse(body);

        const poll = await prisma.poll.create({
            data: {
                question: data.question,
                description: data.description,
                isPublic: data.isPublic,
                allowMultiple: data.allowMultiple,
                endsAt: data.endsAt ? new Date(data.endsAt) : null,
                createdBy: session.user.id,
                options: {
                    create: data.options.map((text, index) => ({
                        text,
                        order: index,
                    })),
                },
            },
            include: {
                options: true,
            },
        });

        return NextResponse.json(poll, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Geçersiz veri", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Poll creation error:", error);
        return NextResponse.json(
            { error: "Anket oluşturulamadı" },
            { status: 500 }
        );
    }
}
