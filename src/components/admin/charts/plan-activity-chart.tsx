"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface PlanActivityChartProps {
  data: Array<{ date: string; count: number }>
}

export function PlanActivityChart({ data }: PlanActivityChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: format(new Date(item.date), "dd MMM", { locale: tr }),
  }))

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Plan Aktivitesi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#374151", fontWeight: 600 }}
            formatter={(value: number) => [`${value} plan`, "Yeni Plan"]}
          />
          <Bar
            dataKey="count"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
