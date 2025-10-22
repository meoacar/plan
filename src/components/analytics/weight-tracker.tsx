"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface WeightLog {
  id: string;
  weight: number;
  note?: string;
  createdAt: string;
}

interface WeightTrackerProps {
  compact?: boolean;
}

export default function WeightTracker({ compact = false }: WeightTrackerProps) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/analytics/weight?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch weight logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/analytics/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          note: note || undefined,
        }),
      });

      if (res.ok) {
        setWeight("");
        setNote("");
        fetchLogs();
      }
    } catch (error) {
      console.error("Failed to add weight log:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = logs.map((log) => ({
    date: format(new Date(log.createdAt), "dd MMM", { locale: tr }),
    kilo: log.weight,
  }));

  const latestWeight = logs[logs.length - 1]?.weight;
  const firstWeight = logs[0]?.weight;
  const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : 0;

  if (compact) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Kilo Takibi</h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="mb-4 flex gap-4">
              <div>
                <p className="text-sm text-gray-600">Güncel</p>
                <p className="text-2xl font-bold">{latestWeight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Değişim</p>
                <p className={`text-2xl font-bold ${weightChange < 0 ? "text-green-600" : "text-red-600"}`}>
                  {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="kilo" stroke="#2d7a4a" strokeWidth={2} dot={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 2", "dataMax + 2"]} />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz kilo kaydı yok</p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Yeni Kilo Kaydı</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium mb-1">
              Kilo (kg)
            </label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="400"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.5"
              required
            />
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">
              Not (opsiyonel)
            </label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bugün nasıl hissediyorsun?"
              rows={2}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Kilo Grafiği</h3>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value={7}>Son 7 gün</option>
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
            <option value={180}>Son 6 ay</option>
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Başlangıç</p>
                <p className="text-xl font-bold">{firstWeight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Güncel</p>
                <p className="text-xl font-bold">{latestWeight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Değişim</p>
                <p className={`text-xl font-bold ${weightChange < 0 ? "text-green-600" : "text-red-600"}`}>
                  {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line type="monotone" dataKey="kilo" stroke="#2d7a4a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
              <h4 className="font-semibold">Son Kayıtlar</h4>
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{log.weight} kg</p>
                    {log.note && <p className="text-sm text-gray-600">{log.note}</p>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(log.createdAt), "dd MMM yyyy", { locale: tr })}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Henüz kilo kaydı yok. Yukarıdaki formdan ilk kaydınızı ekleyin!
          </p>
        )}
      </Card>
    </div>
  );
}
