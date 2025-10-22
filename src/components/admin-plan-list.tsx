"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

interface Plan {
  id: string
  title: string
  slug: string
  status: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface AdminPlanListProps {
  plans: Plan[]
  currentStatus: string
}

export function AdminPlanList({ plans, currentStatus }: AdminPlanListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const updatePlanStatus = async (planId: string, newStatus: string) => {
    setLoading(planId)
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating plan:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <Link href="/admin/plans?status=PENDING">
          <Button 
            variant={currentStatus === "PENDING" ? "default" : "outline"}
            className="font-bold"
          >
            ⏳ Bekleyen
          </Button>
        </Link>
        <Link href="/admin/plans?status=APPROVED">
          <Button 
            variant={currentStatus === "APPROVED" ? "default" : "outline"}
            className="font-bold"
          >
            ✅ Onaylı
          </Button>
        </Link>
        <Link href="/admin/plans?status=REJECTED">
          <Button 
            variant={currentStatus === "REJECTED" ? "default" : "outline"}
            className="font-bold"
          >
            ❌ Reddedilen
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card className="bg-gray-50 border-2 border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-xl font-semibold text-gray-600">📭 Plan bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="shadow-md hover:shadow-lg transition-shadow border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link 
                      href={`/plan/${plan.slug}`}
                      className="text-xl font-bold hover:text-[#2d7a4a] transition-colors"
                      target="_blank"
                    >
                      {plan.title}
                    </Link>
                    <p className="text-base text-gray-700 mt-2 font-medium">
                      👤 Gönderen: {plan.user.name || plan.user.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {new Date(plan.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {plan.status === "PENDING" && (
                      <>
                        <Button
                          onClick={() => updatePlanStatus(plan.id, "APPROVED")}
                          disabled={loading === plan.id}
                          className="font-bold"
                        >
                          {loading === plan.id ? "⏳" : "✅ Onayla"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => updatePlanStatus(plan.id, "REJECTED")}
                          disabled={loading === plan.id}
                          className="font-bold"
                        >
                          {loading === plan.id ? "⏳" : "❌ Reddet"}
                        </Button>
                      </>
                    )}
                    {plan.status === "APPROVED" && (
                      <Button
                        variant="destructive"
                        onClick={() => updatePlanStatus(plan.id, "REJECTED")}
                        disabled={loading === plan.id}
                        className="font-bold"
                      >
                        {loading === plan.id ? "⏳" : "🗑️ Kaldır"}
                      </Button>
                    )}
                    {plan.status === "REJECTED" && (
                      <Button
                        onClick={() => updatePlanStatus(plan.id, "APPROVED")}
                        disabled={loading === plan.id}
                        className="font-bold"
                      >
                        {loading === plan.id ? "⏳" : "✅ Onayla"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
