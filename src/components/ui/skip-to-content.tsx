"use client"

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2d7a4a] focus:text-white focus:rounded-md focus:shadow-lg"
    >
      Ana içeriğe atla
    </a>
  )
}
