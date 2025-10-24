# Mevcut Sistemlere Bildirim Entegrasyonu

Bu dosya, mevcut API route'larınıza bildirim sistemi entegrasyonunu gösterir.

## 1. Takip Sistemi

### Follow API Route'una Bildirim Ekle

```typescript
// src/app/api/follow/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { followingId } = await request.json();

  // Takip işlemi
  const follow = await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId,
    },
  });

  // Takip edilen kullanıcının bilgilerini al
  const followingUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { username: true, name: true },
  });

  // BİLDİRİM GÖNDER
  await createNotification({
    userId: followingId,
    type: 'NEW_FOLLOWER',
    title: 'Yeni Takipçi',
    message: `${session.user.name || session.user.email} seni takip etmeye başladı`,
    actionUrl: `/profil/${session.user.username || session.user.id}`,
    actorId: session.user.id,
  });

  return NextResponse.json(follow);
}
```

## 2. Beğeni Sistemi

### Like API Route'una Bildirim Ekle

```typescript
// src/app/api/plans/[slug]/like/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Plan bilgilerini al
  const plan = await prisma.plan.findUnique({
    where: { slug: params.slug },
    select: { id: true, userId: true, title: true },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  // Beğeni işlemi
  const like = await prisma.like.create({
    data: {
      planId: plan.id,
      userId: session.user.id,
    },
  });

  // Kendi planını beğeniyorsa bildirim gönderme
  if (plan.userId !== session.user.id) {
    // BİLDİRİM GÖNDER
    await createNotification({
      userId: plan.userId,
      type: 'LIKE',
      title: 'Yeni Beğeni',
      message: `${session.user.name || session.user.email} "${plan.title}" planını beğendi`,
      actionUrl: `/plan/${params.slug}`,
      actorId: session.user.id,
      relatedId: plan.id,
    });
  }

  return NextResponse.json(like);
}
```

## 3. Yorum Sistemi

### Comment API Route'una Bildirim Ekle

```typescript
// src/app/api/plans/[slug]/comments/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { body } = await request.json();

  // Plan bilgilerini al
  const plan = await prisma.plan.findUnique({
    where: { slug: params.slug },
    select: { id: true, userId: true, title: true },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  // Yorum oluştur
  const comment = await prisma.comment.create({
    data: {
      planId: plan.id,
      userId: session.user.id,
      body,
    },
  });

  // Kendi planına yorum yapıyorsa bildirim gönderme
  if (plan.userId !== session.user.id) {
    // BİLDİRİM GÖNDER
    await createNotification({
      userId: plan.userId,
      type: 'COMMENT',
      title: 'Yeni Yorum',
      message: `${session.user.name || session.user.email} "${plan.title}" planına yorum yaptı`,
      actionUrl: `/plan/${params.slug}#comment-${comment.id}`,
      actorId: session.user.id,
      relatedId: comment.id,
    });
  }

  return NextResponse.json(comment);
}
```

## 4. Yorum Reaksiyonu

### Comment Reaction API Route'una Bildirim Ekle

```typescript
// src/app/api/comments/[id]/reactions/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { emoji } = await request.json();

  // Yorum bilgilerini al
  const comment = await prisma.comment.findUnique({
    where: { id: params.id },
    include: {
      plan: { select: { slug: true } },
    },
  });

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  // Reaksiyon oluştur
  const reaction = await prisma.commentReaction.create({
    data: {
      commentId: params.id,
      userId: session.user.id,
      emoji,
    },
  });

  // Kendi yorumuna reaksiyon veriyorsa bildirim gönderme
  if (comment.userId !== session.user.id) {
    // BİLDİRİM GÖNDER
    await createNotification({
      userId: comment.userId,
      type: 'COMMENT_REACTION',
      title: 'Yorumuna Reaksiyon',
      message: `${session.user.name || session.user.email} yorumuna ${emoji} reaksiyonu verdi`,
      actionUrl: `/plan/${comment.plan.slug}#comment-${comment.id}`,
      actorId: session.user.id,
      relatedId: comment.id,
    });
  }

  return NextResponse.json(reaction);
}
```

## 5. Duvar Yazısı

### Wall Post API Route'una Bildirim Ekle

```typescript
// src/app/api/wall-posts/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, content } = await request.json();

  // Duvar yazısı oluştur
  const wallPost = await prisma.wallPost.create({
    data: {
      userId,
      authorId: session.user.id,
      content,
    },
  });

  // Kendi duvarına yazıyorsa bildirim gönderme
  if (userId !== session.user.id) {
    // Duvar sahibinin bilgilerini al
    const wallOwner = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    // BİLDİRİM GÖNDER
    await createNotification({
      userId,
      type: 'WALL_POST',
      title: 'Yeni Duvar Yazısı',
      message: `${session.user.name || session.user.email} duvarına bir yazı yazdı`,
      actionUrl: `/profil/${wallOwner?.username || userId}#wall`,
      actorId: session.user.id,
      relatedId: wallPost.id,
    });
  }

  return NextResponse.json(wallPost);
}
```

## 6. Partner İsteği

### Partnership Request API Route'una Bildirim Ekle

```typescript
// src/app/api/partnerships/request/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partnerId, message } = await request.json();

  // Partner isteği oluştur
  const partnership = await prisma.accountabilityPartnership.create({
    data: {
      requesterId: session.user.id,
      partnerId,
      message,
      status: 'PENDING',
    },
  });

  // BİLDİRİM GÖNDER
  await createNotification({
    userId: partnerId,
    type: 'PARTNER_REQUEST',
    title: 'Yeni Partner İsteği',
    message: `${session.user.name || session.user.email} sana partner olmak istiyor`,
    actionUrl: '/hesap-verebilirlik/istekler',
    actorId: session.user.id,
    relatedId: partnership.id,
  });

  return NextResponse.json(partnership);
}
```

### Partnership Accept API Route'una Bildirim Ekle

```typescript
// src/app/api/partnerships/[id]/accept/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Partnership güncelle
  const partnership = await prisma.accountabilityPartnership.update({
    where: { id: params.id },
    data: {
      status: 'ACTIVE',
      acceptedAt: new Date(),
    },
  });

  // BİLDİRİM GÖNDER (İsteği gönderene)
  await createNotification({
    userId: partnership.requesterId,
    type: 'PARTNER_ACCEPTED',
    title: 'Partner İsteği Kabul Edildi',
    message: `${session.user.name || session.user.email} partner isteğini kabul etti`,
    actionUrl: '/hesap-verebilirlik',
    actorId: session.user.id,
    relatedId: partnership.id,
  });

  return NextResponse.json(partnership);
}
```

## 7. Admin Onay Sistemi

### Plan Approval API Route'una Bildirim Ekle

```typescript
// src/app/api/admin/plans/[id]/approve/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Plan onayla
  const plan = await prisma.plan.update({
    where: { id: params.id },
    data: { status: 'APPROVED' },
  });

  // BİLDİRİM GÖNDER
  await createNotification({
    userId: plan.userId,
    type: 'PLAN_APPROVED',
    title: 'Planınız Onaylandı ✅',
    message: `"${plan.title}" planınız onaylandı ve yayınlandı`,
    actionUrl: `/plan/${plan.slug}`,
    relatedId: plan.id,
  });

  return NextResponse.json(plan);
}
```

### Plan Rejection API Route'una Bildirim Ekle

```typescript
// src/app/api/admin/plans/[id]/reject/route.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { rejectionReason } = await request.json();

  // Plan reddet
  const plan = await prisma.plan.update({
    where: { id: params.id },
    data: {
      status: 'REJECTED',
      rejectionReason,
    },
  });

  // BİLDİRİM GÖNDER
  await createNotification({
    userId: plan.userId,
    type: 'PLAN_REJECTED',
    title: 'Planınız Reddedildi',
    message: `"${plan.title}" planınız reddedildi. Sebep: ${rejectionReason}`,
    actionUrl: `/plan-ekle?edit=${plan.id}`,
    relatedId: plan.id,
    metadata: { rejectionReason },
  });

  return NextResponse.json(plan);
}
```

## 8. Gamification Entegrasyonu

### Badge Kazanımı

```typescript
// src/lib/gamification.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function awardBadge(userId: string, badgeType: BadgeType) {
  // Badge bilgilerini al
  const badge = await prisma.badge.findUnique({
    where: { type: badgeType },
  });

  if (!badge) return;

  // Badge'i kullanıcıya ver
  const userBadge = await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  });

  // XP ekle
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: badge.xpReward },
    },
  });

  // BİLDİRİM GÖNDER
  await createNotification({
    userId,
    type: 'BADGE_EARNED',
    title: 'Yeni Rozet Kazandınız! 🏆',
    message: `"${badge.name}" rozetini kazandınız ve ${badge.xpReward} XP aldınız`,
    actionUrl: '/profil#badges',
    relatedId: badge.id,
    metadata: {
      badgeType: badge.type,
      xpReward: badge.xpReward,
    },
  });

  return userBadge;
}
```

### Seviye Atlama

```typescript
// src/lib/gamification.ts (veya benzeri)
import { createNotification } from '@/lib/notifications';

export async function checkLevelUp(userId: string, oldXp: number, newXp: number) {
  const oldLevel = calculateLevel(oldXp);
  const newLevel = calculateLevel(newXp);

  if (newLevel > oldLevel) {
    // Seviye güncelle
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    // BİLDİRİM GÖNDER
    await createNotification({
      userId,
      type: 'LEVEL_UP',
      title: 'Seviye Atladınız! 🎉',
      message: `Tebrikler! ${newLevel}. seviyeye ulaştınız`,
      actionUrl: '/profil',
      metadata: {
        oldLevel,
        newLevel,
      },
    });
  }
}

function calculateLevel(xp: number): number {
  // Seviye hesaplama mantığınız
  return Math.floor(xp / 100) + 1;
}
```

## Notlar

1. **Performans**: Bildirim oluşturma asenkron olduğu için ana işlemi bloklamaz
2. **Hata Yönetimi**: Bildirim hatası ana işlemi etkilemez (try-catch kullanın)
3. **Spam Önleme**: Aynı kullanıcıdan çok fazla bildirim gelmesin diye rate limiting ekleyin
4. **Test**: Her entegrasyonu test edin

## Örnek Try-Catch Kullanımı

```typescript
// Bildirim hatası ana işlemi etkilemesin
try {
  await createNotification({
    userId: targetUserId,
    type: 'NEW_FOLLOWER',
    title: 'Yeni Takipçi',
    message: 'Yeni bir takipçiniz var',
    actionUrl: '/profil',
  });
} catch (error) {
  console.error('Notification error:', error);
  // Hata logla ama devam et
}
```
