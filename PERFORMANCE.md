# Performance Optimization Guide

Bu doküman, Zayıflama Planım uygulamasının performans optimizasyonları için best practice'leri içerir.

## 1. Database Query Optimization

### Prisma Query Best Practices

#### ✅ İyi Örnekler

```typescript
// 1. Sadece gerekli alanları seç
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Gereksiz alanları çekme
  },
});

// 2. İlişkileri akıllıca yükle
const plans = await prisma.plan.findMany({
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
    category: {
      select: {
        id: true,
        name: true,
        color: true,
      },
    },
    _count: {
      select: {
        comments: true,
        likes: true,
      },
    },
  },
  take: 20, // Pagination
  skip: (page - 1) * 20,
});

// 3. Aggregate kullan (count, sum, avg)
const stats = await prisma.plan.aggregate({
  _count: true,
  _avg: {
    viewCount: true,
  },
  where: {
    status: "APPROVED",
  },
});

// 4. Transaction kullan (birden fazla işlem)
await prisma.$transaction([
  prisma.plan.update({ where: { id }, data: { status: "APPROVED" } }),
  prisma.activityLog.create({ data: { ... } }),
]);
```

#### ❌ Kötü Örnekler

```typescript
// 1. Tüm alanları çekme
const users = await prisma.user.findMany(); // Tüm alanlar gelir

// 2. N+1 problemi
const plans = await prisma.plan.findMany();
for (const plan of plans) {
  // Her plan için ayrı query!
  const user = await prisma.user.findUnique({ where: { id: plan.userId } });
}

// 3. Pagination olmadan büyük veri çekme
const allPlans = await prisma.plan.findMany(); // Binlerce kayıt!
```

### Index Kullanımı

Prisma schema'da index'ler tanımlı. Sık sorgulanan alanlar için:

```prisma
model ActivityLog {
  // ...
  @@index([userId, createdAt])
  @@index([type, createdAt])
}

model Plan {
  // ...
  @@index([status, createdAt])
  @@index([userId])
  @@index([categoryId])
}
```

### Query Performance Monitoring

```typescript
// Prisma query logging
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}

// Yavaş query'leri tespit et
const startTime = Date.now();
const result = await prisma.plan.findMany();
const duration = Date.now() - startTime;
if (duration > 1000) {
  console.warn(`Slow query: ${duration}ms`);
}
```

## 2. Next.js Cache Stratejileri

### Route Segment Config

```typescript
// app/admin/analytics/page.tsx
export const revalidate = 300; // 5 dakika cache

// app/admin/activity-log/page.tsx
export const dynamic = "force-dynamic"; // Cache yok (real-time)

// app/page.tsx
export const revalidate = 300; // 5 dakika cache
```

### Data Fetching

```typescript
// Server Component'te cache kullan
async function getPlans() {
  const plans = await prisma.plan.findMany({
    where: { status: "APPROVED" },
    take: 20,
  });
  return plans;
}

// Cache tag ile
async function getPlans() {
  const plans = await fetch("https://api.example.com/plans", {
    next: {
      revalidate: 300,
      tags: ["plans"],
    },
  });
  return plans.json();
}
```

### Cache Invalidation

```typescript
import { revalidateTag, revalidatePath } from "next/cache";

// Plan onaylandığında cache'i temizle
await prisma.plan.update({ where: { id }, data: { status: "APPROVED" } });
revalidateTag("plans");
revalidatePath("/");
```

## 3. Image Optimization

### Next.js Image Component

```tsx
import Image from "next/image";

// ✅ İyi
<Image
  src={plan.imageUrl}
  alt={plan.title}
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>

// ❌ Kötü
<img src={plan.imageUrl} alt={plan.title} />
```

### Image Formats

next.config.ts'de AVIF ve WebP formatları aktif:

```typescript
images: {
  formats: ["image/avif", "image/webp"],
}
```

### UploadThing Optimization

```typescript
// Görsel yüklerken boyut sınırı
const { startUpload } = useUploadThing("imageUploader", {
  onClientUploadComplete: (res) => {
    // Optimize edilmiş URL
    const optimizedUrl = res[0].url;
  },
});
```

## 4. Component Optimization

### React Server Components

```tsx
// ✅ Server Component (default)
async function PlanList() {
  const plans = await getPlans();
  return <div>{/* ... */}</div>;
}

// Client Component sadece gerektiğinde
"use client";
function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Code Splitting

```tsx
// Dynamic import ile lazy loading
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), {
  loading: () => <p>Yükleniyor...</p>,
  ssr: false, // Client-side only
});
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from "react";

// Component memoization
const PlanCard = memo(function PlanCard({ plan }) {
  return <div>{/* ... */}</div>;
});

// Value memoization
const sortedPlans = useMemo(() => {
  return plans.sort((a, b) => b.createdAt - a.createdAt);
}, [plans]);

// Function memoization
const handleClick = useCallback(() => {
  console.log("Clicked");
}, []);
```

## 5. API Route Optimization

### Response Caching

```typescript
// app/api/plans/route.ts
export async function GET(request: Request) {
  const plans = await prisma.plan.findMany({
    where: { status: "APPROVED" },
    take: 20,
  });

  return Response.json(plans, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
```

### Pagination

```typescript
// Cursor-based pagination (daha performanslı)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = 20;

  const plans = await prisma.plan.findMany({
    take: take + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: "desc" },
  });

  const hasMore = plans.length > take;
  const items = hasMore ? plans.slice(0, -1) : plans;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return Response.json({ items, nextCursor, hasMore });
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    identifier
  );

  if (!success) {
    throw new Error("Rate limit exceeded");
  }

  return { limit, reset, remaining };
}
```

## 6. Bundle Size Optimization

### Package Imports

```typescript
// ✅ İyi - Tree shaking
import { Button } from "@/components/ui/button";
import { formatDate } from "date-fns/formatDate";

// ❌ Kötü - Tüm paket yüklenir
import * as dateFns from "date-fns";
```

### Dynamic Imports

```typescript
// Sadece gerektiğinde yükle
const handleExport = async () => {
  const { exportToCSV } = await import("@/lib/export");
  exportToCSV(data);
};
```

### Bundle Analyzer

```bash
# Bundle boyutunu analiz et
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

```bash
# Analiz çalıştır
ANALYZE=true npm run build
```

## 7. Monitoring ve Metrics

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Metrics

```typescript
// lib/metrics.ts
export function trackMetric(name: string, value: number) {
  if (typeof window !== "undefined" && "performance" in window) {
    performance.mark(name);
    console.log(`${name}: ${value}ms`);
  }
}

// Kullanım
const start = Date.now();
await fetchData();
trackMetric("data-fetch", Date.now() - start);
```

## 8. Database Connection Pooling

### Prisma Connection Pool

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Connection Limits

```env
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

## 9. Background Jobs

### Email Queue

```typescript
// Toplu email gönderimini queue'ya al
async function sendBulkEmails(recipients: string[]) {
  // Hepsini birden gönderme!
  for (const recipient of recipients) {
    await emailQueue.add({ to: recipient });
  }
}

// Queue processor (ayrı process)
emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

### Cron Jobs

```typescript
// Ağır işlemleri cron job'a taşı
// app/api/cron/cleanup/route.ts
export async function GET(request: Request) {
  // Eski activity log'ları temizle
  await prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 gün önce
      },
    },
  });

  return Response.json({ success: true });
}
```

## 10. Frontend Performance

### Lazy Loading

```tsx
// Görünür olduğunda yükle
import { useInView } from "react-intersection-observer";

function PlanCard({ plan }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? <PlanContent plan={plan} /> : <Skeleton />}
    </div>
  );
}
```

### Debouncing

```typescript
// Arama için debounce
import { useDebouncedCallback } from "use-debounce";

const handleSearch = useDebouncedCallback((value: string) => {
  fetchResults(value);
}, 300);
```

### Virtual Scrolling

```tsx
// Uzun listeler için
import { useVirtualizer } from "@tanstack/react-virtual";

function LongList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <div key={virtualItem.key}>{items[virtualItem.index]}</div>
      ))}
    </div>
  );
}
```

## Performance Checklist

- [ ] Database query'leri optimize edildi (select, include, pagination)
- [ ] Index'ler tanımlandı (sık sorgulanan alanlar)
- [ ] Cache stratejileri uygulandı (revalidate, tags)
- [ ] Image optimization aktif (Next.js Image, AVIF/WebP)
- [ ] Code splitting yapıldı (dynamic imports)
- [ ] Bundle size kontrol edildi (analyzer)
- [ ] Rate limiting uygulandı (hassas endpoint'ler)
- [ ] Connection pooling yapılandırıldı
- [ ] Background jobs kullanıldı (email, backup)
- [ ] Monitoring aktif (Analytics, Web Vitals)
- [ ] Lazy loading uygulandı (components, images)
- [ ] Debouncing kullanıldı (search, input)
- [ ] Server Components kullanıldı (mümkün olduğunca)
- [ ] Memoization uygulandı (gerekli yerlerde)

## Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Page Load Time**: < 3s

## Tools

- **Lighthouse**: Chrome DevTools > Lighthouse
- **Vercel Analytics**: Dashboard > Analytics
- **Prisma Studio**: `npx prisma studio`
- **Bundle Analyzer**: `ANALYZE=true npm run build`
- **React DevTools Profiler**: Chrome extension
