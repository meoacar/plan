import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [challenges, total] = await Promise.all([
            prisma.challenge.findMany({
                include: {
                    group: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.challenge.count(),
        ]);

        return NextResponse.json({
            challenges,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Challenge listesi hatası:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
        }

        const body = await request.json();
        const challenge = await prisma.challenge.create({
            data: {
                ...body,
                createdBy: session.user.id,
            },
        });

        await logActivity({
            userId: session.user.id,
            type: 'CHALLENGE_CREATED',
            targetId: challenge.id,
            targetType: 'Challenge',
            description: `"${challenge.title}" challenge'ı oluşturuldu`,
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error('Challenge oluşturma hatası:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
