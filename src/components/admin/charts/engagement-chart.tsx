"use client"

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface EngagementChartProps {
  data: Array<{ date: string; comments: number; likes: number }>
}

export function EngagementChart({ data }: EngagementChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: format(new Date(item.date), "dd MMM", { locale: tr }),
  }))

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Etkileşim Aktivitesi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={formattedData}>
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
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
          />
          <Bar
            dataKey="comments"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            name="Yorumlar"
          />
          <Line
            type="monotone"
            dataKey="likes"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            name="Beğeniler"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
