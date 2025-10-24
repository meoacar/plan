# Bildirim Sistemi Kullanım Örnekleri

## 1. Takip Sistemi Bildirimleri

### Yeni Takipçi Bildirimi

```typescript
// src/app/api/follow/route.ts
import { createNotification } from '@/lib/notifications';

// Takip işlemi sonrası
await createNotification({
  userId: followingId, // Takip edilen kişi
  type: 'NEW_FOLLOWER',
  title: 'Yeni Takipçi',
  message: `${followerName} seni takip etmeye başladı`,
  actionUrl: `/profil/${followerUsername}`,
  actorId: followerId,
});
```

## 2. Etkileşim Bildirimleri

### Yorum Bildirimi

```typescript
// src/app/api/plans/[slug]/comments/route.ts
import { createNotification } from '@/lib/notifications';

// Yorum eklendikten sonra
await createNotification({
  userId: plan.userId, // Plan sahibi
  type: 'COMMENT',
  title: 'Yeni Yorum',
  message: `${commenterName} planına yorum yaptı: "${comment.body.substring(0, 50)}..."`,
  actionUrl: `/plan/${plan.slug}#comment-${comment.id}`,
  actorId: commenterId,
  relatedId: comment.id,
});
```

### Beğeni Bildirimi

```typescript
// src/app/api/plans/[slug]/like/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: plan.userId,
  type: 'LIKE',
  title: 'Yeni Beğeni',
  message: `${likerName} planını beğendi`,
  actionUrl: `/plan/${plan.slug}`,
  actorId: likerId,
  relatedId: plan.id,
});
```

### Yorum Reaksiyonu Bildirimi

```typescript
// src/app/api/comments/[id]/reactions/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: comment.userId, // Yorum sahibi
  type: 'COMMENT_REACTION',
  title: 'Yorumuna Reaksiyon',
  message: `${reactorName} yorumuna ${emoji} reaksiyonu verdi`,
  actionUrl: `/plan/${plan.slug}#comment-${comment.id}`,
  actorId: reactorId,
  relatedId: comment.id,
});
```

## 3. Partner Sistemi Bildirimleri

### Partner İsteği Bildirimi

```typescript
// src/app/api/partnerships/request/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: partnerId,
  type: 'PARTNER_REQUEST',
  title: 'Yeni Partner İsteği',
  message: `${requesterName} sana partner olmak istiyor`,
  actionUrl: '/hesap-verebilirlik/istekler',
  actorId: requesterId,
  relatedId: partnership.id,
});
```

### Partner Kabul Bildirimi

```typescript
// src/app/api/partnerships/[id]/accept/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: partnership.requesterId,
  type: 'PARTNER_ACCEPTED',
  title: 'Partner İsteği Kabul Edildi',
  message: `${accepterName} partner isteğini kabul etti`,
  actionUrl: '/hesap-verebilirlik',
  actorId: accepterId,
  relatedId: partnership.id,
});
```

## 4. Gamification Bildirimleri

### Rozet Kazanımı Bildirimi

```typescript
// src/lib/gamification.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: userId,
  type: 'BADGE_EARNED',
  title: 'Yeni Rozet Kazandınız! 🏆',
  message: `"${badge.name}" rozetini kazandınız`,
  actionUrl: '/profil#badges',
  relatedId: badge.id,
  metadata: {
    badgeType: badge.type,
    xpReward: badge.xpReward,
  },
});
```

### Seviye Atlama Bildirimi

```typescript
// src/lib/gamification.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: userId,
  type: 'LEVEL_UP',
  title: 'Seviye Atladınız! 🎉',
  message: `Tebrikler! ${newLevel}. seviyeye ulaştınız`,
  actionUrl: '/profil',
  metadata: {
    oldLevel: oldLevel,
    newLevel: newLevel,
  },
});
```

## 5. İçerik Onay Bildirimleri

### Plan Onayı Bildirimi

```typescript
// src/app/api/admin/plans/[id]/approve/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: plan.userId,
  type: 'PLAN_APPROVED',
  title: 'Planınız Onaylandı ✅',
  message: `"${plan.title}" planınız onaylandı ve yayınlandı`,
  actionUrl: `/plan/${plan.slug}`,
  relatedId: plan.id,
});
```

### Plan Reddi Bildirimi

```typescript
// src/app/api/admin/plans/[id]/reject/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: plan.userId,
  type: 'PLAN_REJECTED',
  title: 'Planınız Reddedildi',
  message: `"${plan.title}" planınız reddedildi. Sebep: ${rejectionReason}`,
  actionUrl: `/plan-ekle?edit=${plan.id}`,
  relatedId: plan.id,
  metadata: {
    rejectionReason,
  },
});
```

### Tarif Onayı Bildirimi

```typescript
// src/app/api/admin/recipes/[id]/approve/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: recipe.userId,
  type: 'RECIPE_APPROVED',
  title: 'Tarifiniz Onaylandı ✅',
  message: `"${recipe.title}" tarifiniz onaylandı ve yayınlandı`,
  actionUrl: `/tarifler/${recipe.slug}`,
  relatedId: recipe.id,
});
```

## 6. Sosyal Grup Bildirimleri

### Grup Daveti Bildirimi

```typescript
// src/app/api/groups/[id]/invite/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: invitedUserId,
  type: 'GROUP_INVITE',
  title: 'Grup Daveti',
  message: `${inviterName} seni "${group.name}" grubuna davet etti`,
  actionUrl: `/gruplar/${group.slug}`,
  actorId: inviterId,
  relatedId: group.id,
});
```

### Challenge Daveti Bildirimi

```typescript
// src/app/api/challenges/[id]/invite/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: invitedUserId,
  type: 'CHALLENGE_INVITE',
  title: 'Challenge Daveti',
  message: `${inviterName} seni "${challenge.title}" challenge'ına davet etti`,
  actionUrl: `/challenges/${challenge.id}`,
  actorId: inviterId,
  relatedId: challenge.id,
});
```

## 7. Duvar Yazısı Bildirimi

```typescript
// src/app/api/wall-posts/route.ts
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: wallOwnerId,
  type: 'WALL_POST',
  title: 'Yeni Duvar Yazısı',
  message: `${authorName} duvarına bir yazı yazdı`,
  actionUrl: `/profil/${wallOwnerUsername}#wall`,
  actorId: authorId,
  relatedId: wallPost.id,
});
```

## 8. Toplu Bildirim Gönderme

```typescript
// Birden fazla kullanıcıya bildirim gönderme
import { createNotification } from '@/lib/notifications';

const userIds = ['user1', 'user2', 'user3'];

await Promise.all(
  userIds.map((userId) =>
    createNotification({
      userId,
      type: 'CHALLENGE_INVITE',
      title: 'Yeni Challenge',
      message: 'Yeni bir challenge başladı, katıl!',
      actionUrl: '/challenges',
    })
  )
);
```

## 9. Haftalık Özet Email Gönderme

```typescript
// Cron job veya scheduled task
import { sendWeeklyDigest } from '@/lib/email-notifications';
import { prisma } from '@/lib/prisma';

// Haftalık özet almak isteyen kullanıcıları bul
const users = await prisma.user.findMany({
  where: {
    notificationPreference: {
      emailWeeklyDigest: true,
    },
  },
  select: { id: true },
});

// Her kullanıcıya özet gönder
for (const user of users) {
  await sendWeeklyDigest(user.id);
}
```

## 10. Bildirim Okuma ve Silme

```typescript
// Client-side
async function handleNotificationClick(notificationId: string) {
  // Okundu işaretle
  await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
  });
}

async function handleDeleteNotification(notificationId: string) {
  // Sil
  await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}

async function handleMarkAllAsRead() {
  // Tümünü okundu işaretle
  await fetch('/api/notifications/read-all', {
    method: 'POST',
  });
}
```

## Best Practices

1. **Spam Önleme**: Aynı kullanıcıdan kısa sürede çok fazla bildirim gelmesin
2. **Gruplama**: Benzer bildirimleri grupla (örn: "5 kişi planını beğendi")
3. **Öncelik**: Önemli bildirimleri öne çıkar
4. **Temizlik**: Eski bildirimleri otomatik sil (örn: 30 gün sonra)
5. **Test**: Production'a geçmeden önce tüm bildirim tiplerini test et
