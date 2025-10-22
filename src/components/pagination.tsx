"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "./ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
}

export function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  const pages = []
  const showPages = 5
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
  let endPage = Math.min(totalPages, startPage + showPages - 1)

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-12">
      <div className="text-base text-gray-400 font-medium">
        Toplam <span className="font-bold text-white text-lg">{total}</span> plan
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-12 px-6 bg-gray-800/50 border-gray-700 text-gray-300 rounded-xl font-bold hover:border-blue-500/50 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Önceki
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              onClick={() => handlePageChange(1)}
              className="h-12 w-12 bg-gray-800/50 border-gray-700 text-gray-300 rounded-xl font-bold hover:border-blue-500/50 hover:bg-gray-800 transition-all"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2 text-gray-600">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
            className={`h-12 w-12 rounded-xl font-bold transition-all ${
              page === currentPage
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-110"
                : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-purple-500/50 hover:bg-gray-800"
            }`}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-600">...</span>}
            <Button
              variant="outline"
              onClick={() => handlePageChange(totalPages)}
              className="h-12 w-12 bg-gray-800/50 border-gray-700 text-gray-300 rounded-xl font-bold hover:border-blue-500/50 hover:bg-gray-800 transition-all"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-12 px-6 bg-gray-800/50 border-gray-700 text-gray-300 rounded-xl font-bold hover:border-blue-500/50 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Sonraki →
        </Button>
      </div>
    </div>
  )
}
