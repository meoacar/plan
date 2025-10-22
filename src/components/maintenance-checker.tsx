"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * Client-side bakım modu kontrolü
 * Her sayfa yüklendiğinde çalışır
 */
export function MaintenanceChecker() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Maintenance sayfasındaysak kontrol yapma
    if (pathname === "/maintenance") {
      return
    }

    // Admin kullanıcıysa kontrol yapma
    if (session?.user?.role === "ADMIN") {
      return
    }

    // Bakım modu kontrolü yap
    fetch("/api/maintenance-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.maintenanceMode === true) {
          router.push("/maintenance")
        }
      })
      .catch((error) => {
        console.error("Maintenance check error:", error)
      })
  }, [session, router, pathname])

  return null
}
