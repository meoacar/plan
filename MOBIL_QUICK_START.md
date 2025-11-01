# Mobil Uyumluluk - Hızlı Başlangıç Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Yeni Bileşenler

Mobil uyumlu grup sistemi için aşağıdaki yeni bileşenler eklendi:

```tsx
// Mobil bottom navigation
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

// Grup tab navigasyonu
import { MobileGroupTabs } from '@/components/groups/mobile-group-tabs';

// Lazy loading image
import { LazyImage } from '@/components/lazy-image';

// Optimized group card
import { OptimizedGroupCard } from '@/components/groups/optimized-group-card';
```

### 2. Yeni Hook'lar

```tsx
// Mobil cihaz kontrolü
import { useMobile } from '@/hooks/use-mobile';
const isMobile = useMobile(768); // breakpoint

// Touch gesture desteği
import { useSwipe } from '@/hooks/use-swipe';
const swipeHandlers = useSwipe({
  onSwipeLeft: () => console.log('Left'),
  onSwipeRight: () => console.log('Right'),
});

// Reduced motion kontrolü
import { useReducedMotion } from '@/hooks/use-reduced-motion';
const prefersReducedMotion = useReducedMotion();
```

### 3. Performance Utilities

```tsx
import {
  getDeviceType,
  getConnectionSpeed,
  getOptimalImageQuality,
  measurePerformance,
  throttle,
  debounce,
} from '@/lib/mobile-performance';

// Cihaz tipi
const deviceType = getDeviceType(); // 'mobile' | 'tablet' | 'desktop'

// Bağlantı hızı
const speed = getConnectionSpeed(); // 'slow' | 'medium' | 'fast'

// Optimal image quality
const quality = getOptimalImageQuality(); // 50-85

// Performance ölçümü
const perf = measurePerformance('my-operation');
perf.start();
// ... işlem
perf.end(); // Logs duration
```

## 📱 Mobil Bileşen Kullanımı

### Bottom Navigation

Layout'a otomatik olarak eklendi:

```tsx
// src/app/layout.tsx
<MobileBottomNav 
  isAuthenticated={!!session?.user} 
  unreadCount={unreadCount}
/>
```

Özellikler:
- Sadece mobilde görünür (< 768px)
- Ana sayfa, Gruplar, Bildirimler, Profil, Menü
- Badge desteği
- Slide-up menü

### Grup Tab Navigasyonu

Grup detay sayfalarında kullanılır:

```tsx
// src/app/groups/[slug]/page.tsx
<MobileGroupTabs groupSlug={slug} isAdmin={isAdmin} />
```

Özellikler:
- Yatay scroll
- Swipe gesture
- Sticky positioning
- Scroll indicators

### Lazy Image

Performanslı image loading:

```tsx
<LazyImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false} // İlk ekranda değilse false
  sizes="(max-width: 640px) 100vw, 50vw"
  quality={75} // veya getOptimalImageQuality()
/>
```

## 🎨 CSS Utility Sınıfları

### Touch-Friendly

```tsx
// Minimum touch target
<button className="touch-target">Button</button>

// Touch manipulation
<button className="touch-manipulation">Button</button>
```

### Safe Area (iOS)

```tsx
// Safe area padding
<div className="safe-area-top">Content</div>
<div className="safe-area-bottom">Content</div>
```

### Scrolling

```tsx
// Smooth touch scroll
<div className="touch-scroll overflow-y-auto">
  {/* content */}
</div>

// Hide scrollbar
<div className="scrollbar-hide overflow-x-auto">
  {/* content */}
</div>
```

### Responsive Breakpoints

```tsx
// Extra small (475px+)
<span className="hidden xs:inline">Text</span>

// Standard breakpoints
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* content */}
</div>
```

## 🔧 Responsive Design Patterns

### Mobile-First Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {items.map(item => (
    <div key={item.id} className="p-4 sm:p-6">
      {/* content */}
    </div>
  ))}
</div>
```

### Adaptive Padding

```tsx
<div className="p-4 sm:p-6 lg:p-8">
  <h1 className="text-lg sm:text-xl lg:text-2xl">Title</h1>
  <p className="text-sm sm:text-base">Description</p>
</div>
```

### Touch-Friendly Buttons

```tsx
<button className="
  min-h-[44px] min-w-[44px]
  px-4 py-2
  rounded-lg
  hover:bg-gray-100
  active:bg-gray-200
  transition-colors
  touch-manipulation
">
  Click Me
</button>
```

### Conditional Rendering

```tsx
function MyComponent() {
  const isMobile = useMobile();
  
  return (
    <>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </>
  );
}
```

## ⚡ Performance Best Practices

### 1. Image Optimization

```tsx
// Lazy load images
<LazyImage
  src={imageUrl}
  alt="Description"
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={getOptimalImageQuality()}
  priority={index < 3} // İlk 3 image priority
/>
```

### 2. Debounced Search

```tsx
import { useDebounce } from '@/hooks/use-debounce';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  useEffect(() => {
    // API call with debouncedSearch
  }, [debouncedSearch]);
  
  return <input value={search} onChange={e => setSearch(e.target.value)} />;
}
```

### 3. Virtual Scrolling

```tsx
import { VirtualList } from '@/components/virtual-list';

function LongList({ items }) {
  return (
    <VirtualList
      items={items}
      itemHeight={100}
      containerHeight={600}
      renderItem={(item, index) => (
        <div key={item.id}>{item.name}</div>
      )}
    />
  );
}
```

### 4. Reduced Animations

```tsx
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
      Content
    </div>
  );
}
```

## 🧪 Testing

### Mobil Test Checklist

```bash
# 1. Farklı cihazlar
- iPhone 12/13/14/15 (Safari)
- Samsung Galaxy S21/S22 (Chrome)
- iPad (Safari)
- Android Tablet (Chrome)

# 2. Farklı bağlantılar
- Fast 4G
- Slow 3G
- Offline mode

# 3. Farklı durumlar
- Portrait orientation
- Landscape orientation
- Low battery mode
- Reduced motion enabled

# 4. Touch interactions
- Tap
- Long press
- Swipe left/right
- Pinch zoom (disabled on inputs)
- Pull to refresh
```

### Chrome DevTools

```bash
# 1. Device toolbar (Ctrl+Shift+M)
# 2. Network throttling (Slow 3G)
# 3. Performance profiling
# 4. Lighthouse audit
```

## 🐛 Troubleshooting

### Sorun: Bottom nav görünmüyor
```tsx
// Çözüm: Layout'ta MobileBottomNav eklenmiş mi kontrol et
// src/app/layout.tsx içinde olmalı
```

### Sorun: Swipe çalışmıyor
```tsx
// Çözüm: Touch events doğru mu?
const swipeHandlers = useSwipe({
  onSwipeLeft: () => console.log('Left'),
  onSwipeRight: () => console.log('Right'),
});

return <div {...swipeHandlers}>Content</div>;
```

### Sorun: Images yüklenmiyor
```tsx
// Çözüm: LazyImage src doğru mu?
// Priority images için priority={true} ekle
<LazyImage src={validUrl} alt="..." priority={true} />
```

### Sorun: Performance düşük
```tsx
// Çözüm: Performance monitor'ü aç (dev mode)
// Bottom-right köşede 📊 butonu
// Memory, connection, device type kontrol et
```

## 📚 Daha Fazla Bilgi

- [Mobil Uyumluluk Özet](./MOBIL_UYUMLULUK_OZET.md)
- [Grup Geliştirme Tasks](./.kiro/specs/grup-gelistirme/tasks.md)
- [Design Document](./.kiro/specs/grup-gelistirme/design.md)

## 💡 İpuçları

1. **Her zaman mobile-first düşün**: Önce mobil tasarla, sonra desktop'a genişlet
2. **Touch targets minimum 44x44px**: Apple ve Google standartları
3. **Font size minimum 16px**: iOS zoom'u önlemek için
4. **Lazy load everything**: Sadece görünür olanları yükle
5. **Debounce user input**: API çağrılarını azalt
6. **Test on real devices**: Emulator yeterli değil
7. **Monitor performance**: Development mode'da performance monitor kullan
8. **Respect user preferences**: Reduced motion, dark mode, vb.

## 🎯 Sonraki Adımlar

1. Tüm grup bileşenlerini test et
2. Real device testleri yap
3. Performance metrics topla
4. User feedback al
5. Gerekirse optimize et

---

**Not**: Bu döküman Görev 17 (Mobil uyumluluk ve responsive tasarım) kapsamında oluşturulmuştur.
