"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface EngagementChartProps {
  data: Array<{ date: string; comments: number; likes: number }>
}

export function EngagementChart({ data }: EngagementChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Etkileşim Aktivitesi</h3>
        <div className="flex h-[300px] items-center justify-center text-gray-500">
          Veri bulunamadı
        </div>
      </div>
    )
  }

  const formattedData = data.map((item) => {
    try {
      const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
      const [year, month, day] = dateStr.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return {
        ...item,
        formattedDate: format(date, "d MMM", { locale: tr }),
      }
    } catch (error) {
      console.error('Date parsing error:', error, item.date)
      return {
        ...item,
        formattedDate: item.date,
      }
    }
  })

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Etkileşim Aktivitesi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#374151", fontWeight: 600 }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="comments"
            name="Yorumlar"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="likes"
            name="Beğeniler"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: "#ec4899", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
