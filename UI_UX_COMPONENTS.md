# UI/UX Component'leri Kullanım Kılavuzu

Bu doküman, Task 12 kapsamında eklenen UI/UX iyileştirme component'lerinin kullanımını açıklar.

## 1. Loading States

### Spinner
Basit yükleme göstergesi:

```tsx
import { Spinner } from "@/components/ui/spinner"

<Spinner size="sm" />  // Küçük
<Spinner size="md" />  // Orta (varsayılan)
<Spinner size="lg" />  // Büyük
```

### Skeleton
İçerik yüklenirken placeholder gösterimi:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />
```

### Progress Bar
İlerleme göstergesi:

```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={60} max={100} />
```

### Button Loading State
Button'a loading prop'u eklendi:

```tsx
import { Button } from "@/components/ui/button"

<Button loading={isLoading}>
  Kaydet
</Button>
```

### Hazır Skeleton Component'leri
Admin paneli için özel skeleton'lar:

```tsx
import { 
  TableSkeleton, 
  StatCardSkeleton, 
  ChartSkeleton,
  FormSkeleton,
  CommentListSkeleton,
  CategoryListSkeleton 
} from "@/components/admin/skeletons"

<TableSkeleton rows={5} />
<StatCardSkeleton />
<ChartSkeleton />
```

## 2. Toast Notifications

### Kullanım
```tsx
"use client"

import { useToast } from "@/components/ui/toast"

function MyComponent() {
  const { addToast } = useToast()

  const handleSuccess = () => {
    addToast({
      type: "success",
      title: "Başarılı!",
      description: "İşlem tamamlandı",
      duration: 5000 // opsiyonel, varsayılan 5000ms
    })
  }

  const handleError = () => {
    addToast({
      type: "error",
      title: "Hata!",
      description: "Bir sorun oluştu"
    })
  }

  const handleWarning = () => {
    addToast({
      type: "warning",
      title: "Uyarı",
      description: "Dikkat edilmesi gereken bir durum"
    })
  }

  const handleInfo = () => {
    addToast({
      type: "info",
      title: "Bilgi",
      description: "Bilgilendirme mesajı"
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Success Toast</button>
      <button onClick={handleError}>Error Toast</button>
      <button onClick={handleWarning}>Warning Toast</button>
      <button onClick={handleInfo}>Info Toast</button>
    </div>
  )
}
```

### Helper Fonksiyonlar
```tsx
import { toast } from "@/lib/toast-helpers"
import { useToast } from "@/components/ui/toast"

const { addToast } = useToast()

addToast(toast.success("Başarılı!", "İşlem tamamlandı"))
addToast(toast.error("Hata!", "Bir sorun oluştu"))
addToast(toast.warning("Uyarı", "Dikkat"))
addToast(toast.info("Bilgi", "Bilgilendirme"))
```

## 3. Confirmation Modals

### Dialog Component
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Başlık</DialogTitle>
          <DialogDescription>Açıklama metni</DialogDescription>
        </DialogHeader>
        <div>İçerik</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={handleConfirm}>Onayla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Confirm Dialog
Silme ve kritik işlemler için:

```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    // Silme işlemi
    await deleteItem()
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)}>
        Sil
      </Button>
      
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="Silme Onayı"
        description="Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        variant="destructive"
      />
    </>
  )
}
```

### useConfirmDialog Hook
Daha kolay kullanım için:

```tsx
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDelete = () => {
    confirm({
      title: "Silme Onayı",
      description: "Bu öğeyi silmek istediğinizden emin misiniz?",
      onConfirm: async () => {
        await deleteItem()
      },
      variant: "destructive",
      confirmText: "Sil",
      cancelText: "İptal"
    })
  }

  return (
    <>
      <Button variant="destructive" onClick={handleDelete}>Sil</Button>
      {ConfirmDialog}
    </>
  )
}
```

## 4. Empty States

### Genel Empty State
```tsx
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

<EmptyState
  icon="📋"
  title="Henüz içerik yok"
  description="İlk içeriğinizi oluşturmak için butona tıklayın"
  action={<Button>Yeni Oluştur</Button>}
/>
```

### Hazır Empty State Component'leri
Admin paneli için özel empty state'ler:

```tsx
import { 
  NoCommentsEmpty,
  NoCategoriesEmpty,
  NoTagsEmpty,
  NoPlansEmpty,
  NoUsersEmpty,
  NoActivityEmpty,
  NoEmailsEmpty,
  NoBackupsEmpty,
  NoBannedWordsEmpty,
  NoBlockedContentEmpty,
  NoSearchResultsEmpty,
  ErrorState
} from "@/components/admin/empty-states"

// Kullanım
{comments.length === 0 && <NoCommentsEmpty />}
{categories.length === 0 && <NoCategoriesEmpty onAdd={handleAddCategory} />}
{searchResults.length === 0 && <NoSearchResultsEmpty query={searchQuery} />}
{error && <ErrorState onRetry={handleRetry} />}
```

## 5. Responsive Design

### Responsive Table
```tsx
import { ResponsiveTable } from "@/components/ui/responsive-table"

<ResponsiveTable>
  <table className="min-w-full">
    {/* Table içeriği */}
  </table>
</ResponsiveTable>
```

### Responsive Grid
```tsx
import { ResponsiveGrid } from "@/components/ui/responsive-table"

<ResponsiveGrid 
  cols={{ default: 1, md: 2, lg: 3 }}
  gap={4}
>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</ResponsiveGrid>
```

### Admin Sidebar
Sidebar artık mobil uyumlu:
- Mobilde hamburger menü ile açılır/kapanır
- Desktop'ta daraltılabilir
- Otomatik route değişiminde kapanır

## 6. Accessibility

### Skip to Content
Ana layout'a otomatik eklendi. Klavye ile Tab tuşuna basıldığında görünür.

### Form Field
ARIA etiketleri ile erişilebilir form alanları:

```tsx
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"

<FormField
  label="Email"
  htmlFor="email"
  required
  description="Geçerli bir email adresi girin"
  error={errors.email}
>
  <Input type="email" />
</FormField>
```

### Label Component
```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="name" required>
  İsim
</Label>
<Input id="name" />
```

### Visually Hidden
Ekran okuyucular için görünmez metin:

```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden"

<button>
  <VisuallyHidden>Menüyü aç</VisuallyHidden>
  ☰
</button>
```

### Keyboard Navigation Hook
```tsx
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"

function MyComponent() {
  useKeyboardNavigation({
    onEscape: () => closeModal(),
    onEnter: () => submitForm(),
    onArrowUp: () => selectPrevious(),
    onArrowDown: () => selectNext(),
    enabled: isOpen
  })
}
```

### Focus Trap Hook
Modal'larda focus'u içeride tutmak için:

```tsx
import { useFocusTrap } from "@/hooks/use-keyboard-navigation"

function Modal() {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen)

  return <div ref={modalRef}>...</div>
}
```

## Global Özellikler

### Focus Indicators
Tüm interaktif element'lerde otomatik focus göstergesi aktif.

### Reduced Motion
Kullanıcı sistem ayarlarında animasyonları kapattıysa, animasyonlar otomatik olarak devre dışı kalır.

### Screen Reader Support
Tüm component'ler ekran okuyucu uyumlu ARIA etiketleri içerir.

## Örnek Kullanım Senaryoları

### Veri Yükleme
```tsx
function DataList() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  if (data.length === 0) {
    return <NoDataEmpty />
  }

  return <Table data={data} />
}
```

### Form Gönderimi
```tsx
function MyForm() {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await saveData()
      addToast(toast.success("Başarılı!", "Veriler kaydedildi"))
    } catch (error) {
      addToast(toast.error("Hata!", "Kayıt başarısız"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="İsim" htmlFor="name" required>
        <Input id="name" />
      </FormField>
      <Button type="submit" loading={loading}>
        Kaydet
      </Button>
    </form>
  )
}
```

### Silme İşlemi
```tsx
function DeleteButton({ itemId }) {
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const { addToast } = useToast()

  const handleDelete = () => {
    confirm({
      title: "Silme Onayı",
      description: "Bu öğeyi silmek istediğinizden emin misiniz?",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteItem(itemId)
          addToast(toast.success("Başarılı!", "Öğe silindi"))
        } catch (error) {
          addToast(toast.error("Hata!", "Silme başarısız"))
        }
      }
    })
  }

  return (
    <>
      <Button variant="destructive" onClick={handleDelete}>
        Sil
      </Button>
      {ConfirmDialog}
    </>
  )
}
```

## Notlar

- Toast Provider zaten `Providers` component'ine eklenmiş durumda
- Dialog component'leri otomatik olarak focus trap ve keyboard navigation içerir
- Tüm component'ler TypeScript tip güvenliği sağlar
- Responsive design için Tailwind CSS breakpoint'leri kullanılır (sm, md, lg, xl)
- Accessibility özellikleri otomatik olarak aktiftir, ekstra yapılandırma gerekmez
