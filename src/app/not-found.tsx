import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="text-9xl font-extrabold text-[#2d7a4a] mb-6">404</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          😕 Sayfa Bulunamadı
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link href="/">
          <Button size="lg" className="font-bold text-lg px-8 py-6 h-auto">
            🏠 Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </div>
  )
}
