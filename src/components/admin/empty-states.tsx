import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NoCommentsEmpty() {
  return (
    <EmptyState
      icon="💬"
      title="Henüz yorum yok"
      description="Platformda henüz hiç yorum yapılmamış. Kullanıcılar plan detay sayfalarından yorum yapabilir."
    />
  )
}

export function NoCategoriesEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🏷️"
      title="Henüz kategori yok"
      description="Planları organize etmek için kategoriler oluşturun. Kategoriler kullanıcıların planları daha kolay bulmasına yardımcı olur."
      action={
        onAdd && (
          <Button onClick={onAdd}>
            İlk Kategoriyi Oluştur
          </Button>
        )
      }
    />
  )
}

export function NoTagsEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🔖"
      title="Henüz etiket yok"
      description="Planları etiketlemek için etiketler oluşturun. Etiketler planların daha detaylı kategorize edilmesini sağlar."
      action={
        onAdd && (
          <Button onClick={onAdd}>
            İlk Etiketi Oluştur
          </Button>
        )
      }
    />
  )
}

export function NoPlansEmpty() {
  return (
    <EmptyState
      icon="📋"
      title="Henüz plan yok"
      description="Platformda henüz onay bekleyen veya yayınlanmış plan bulunmuyor."
    />
  )
}

export function NoUsersEmpty() {
  return (
    <EmptyState
      icon="👥"
      title="Henüz kullanıcı yok"
      description="Platformda henüz kayıtlı kullanıcı bulunmuyor."
    />
  )
}

export function NoActivityEmpty() {
  return (
    <EmptyState
      icon="📝"
      title="Henüz aktivite yok"
      description="Seçilen filtrelere uygun aktivite kaydı bulunamadı."
    />
  )
}

export function NoEmailsEmpty() {
  return (
    <EmptyState
      icon="📧"
      title="Henüz email kampanyası yok"
      description="Kullanıcılara toplu email göndermek için yeni bir kampanya oluşturun."
    />
  )
}

export function NoBackupsEmpty() {
  return (
    <EmptyState
      icon="💾"
      title="Henüz yedek yok"
      description="Veritabanı yedeği oluşturmak için manuel yedekleme butonunu kullanın veya otomatik yedekleme ayarlayın."
    />
  )
}

export function NoBannedWordsEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🛡️"
      title="Henüz yasaklı kelime yok"
      description="İçerik moderasyonu için yasaklı kelimeler ekleyin. Bu kelimeler içeren içerikler otomatik olarak incelemeye alınır."
      action={
        onAdd && (
          <Button onClick={onAdd}>
            İlk Yasaklı Kelimeyi Ekle
          </Button>
        )
      }
    />
  )
}

export function NoBlockedContentEmpty() {
  return (
    <EmptyState
      icon="✅"
      title="Engellenen içerik yok"
      description="Harika! Şu anda moderasyon bekleyen içerik bulunmuyor."
    />
  )
}

export function NoSearchResultsEmpty({ query }: { query?: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="Sonuç bulunamadı"
      description={
        query
          ? `"${query}" araması için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
          : "Arama kriterlerinize uygun sonuç bulunamadı."
      }
    />
  )
}

export function ErrorState({ 
  title = "Bir hata oluştu",
  description = "Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.",
  onRetry
}: { 
  title?: string
  description?: string
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={
        onRetry && (
          <Button onClick={onRetry}>
            Tekrar Dene
          </Button>
        )
      }
    />
  )
}
