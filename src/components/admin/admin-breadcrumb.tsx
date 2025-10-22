"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

interface BreadcrumbItem {
  label: string
  href: string
}

const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  plans: "Planlar",
  users: "Kullanıcılar",
  comments: "Yorumlar",
  analytics: "Analitik",
  categories: "Kategoriler",
  moderation: "Moderasyon",
  emails: "Email",
  "activity-log": "Aktivite Logu",
  settings: "Ayarlar",
  maintenance: "Bakım",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  
  // Split pathname and filter empty strings
  const segments = pathname.split("/").filter(Boolean)
  
  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = routeLabels[segment] || segment
    
    return { label, href }
  })

  // Don't show breadcrumb if we're on the admin root
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        href="/admin" 
        className="hover:text-[#2d7a4a] transition-colors"
      >
        Dashboard
      </Link>
      
      {breadcrumbs.slice(1).map((item, index) => {
        const isLast = index === breadcrumbs.length - 2
        
        return (
          <Fragment key={item.href}>
            <span className="text-gray-400">/</span>
            {isLast ? (
              <span className="font-medium text-[#2d7a4a]">{item.label}</span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-[#2d7a4a] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
