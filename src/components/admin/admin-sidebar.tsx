"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface NavItem {
  href: string
  label: string
  icon: string
}

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/plans", label: "Planlar", icon: "📋" },
  { href: "/admin/users", label: "Kullanıcılar", icon: "👥" },
  { href: "/admin/comments", label: "Yorumlar", icon: "💬" },
  { href: "/admin/analytics", label: "Analitik", icon: "📈" },
  { href: "/admin/categories", label: "Kategoriler", icon: "🏷️" },
  { href: "/admin/moderation", label: "Moderasyon", icon: "🛡️" },
  { href: "/admin/emails", label: "Email", icon: "📧" },
  { href: "/admin/activity-log", label: "Aktivite", icon: "📝" },
  { href: "/admin/seo", label: "SEO", icon: "🌐" },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙️" },
  { href: "/admin/maintenance", label: "Bakım", icon: "🔧" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Menüyü aç"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300",
          "lg:sticky lg:top-0",
          isCollapsed ? "w-20" : "w-64",
          "flex flex-col",
          // Mobile styles
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-2xl">⚙️</span>
              <span className="font-bold text-lg text-[#2d7a4a]">Admin Panel</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="flex items-center justify-center w-full">
              <span className="text-2xl">⚙️</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          >
            <svg
              className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-gray-100",
                      isActive && "bg-[#2d7a4a] text-white hover:bg-[#236038]",
                      !isActive && "text-gray-700",
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all",
              "hover:bg-gray-100 text-gray-700",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Ana Sayfaya Dön" : undefined}
          >
            <span className="text-xl flex-shrink-0">🏠</span>
            {!isCollapsed && (
              <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  )
}
