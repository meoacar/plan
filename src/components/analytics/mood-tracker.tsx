"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface MoodLog {
  id: string;
  mood: number;
  stress?: number;
  note?: string;
  createdAt: string;
}

interface MoodTrackerProps {
  compact?: boolean;
}

const moodEmojis = ["😢", "😕", "😐", "🙂", "😄"];
const stressEmojis = ["😌", "🙂", "😐", "😰", "😫"];

export default function MoodTracker({ compact = false }: MoodTrackerProps) {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/analytics/mood?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch mood logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/analytics/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          stress,
          note: note || undefined,
        }),
      });

      if (res.ok) {
        setMood(3);
        setStress(3);
        setNote("");
        fetchLogs();
      }
    } catch (error) {
      console.error("Failed to add mood log:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageMood = logs.length > 0
    ? (logs.reduce((sum, log) => sum + log.mood, 0) / logs.length).toFixed(1)
    : "0";

  if (compact) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ruh Hali Takibi</h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Ortalama Ruh Hali</p>
              <p className="text-4xl">{moodEmojis[Math.round(parseFloat(averageMood)) - 1]}</p>
              <p className="text-sm text-gray-600 mt-1">{averageMood}/5</p>
            </div>
            <div className="space-y-2">
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className="text-2xl">{moodEmojis[log.mood - 1]}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {format(new Date(log.createdAt), "dd MMM", { locale: tr })}
                    </p>
                    {log.note && <p className="text-xs text-gray-500">{log.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz ruh hali kaydı yok</p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ruh Hali Kaydı</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ruh Halim: {moodEmojis[mood - 1]}
            </label>
            <div className="flex gap-2 justify-between mb-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMood(index + 1)}
                  className={`text-4xl p-2 rounded transition ${
                    mood === index + 1 ? "bg-green-100 scale-110" : "hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Çok Kötü</span>
              <span>Harika</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stres Seviyesi: {stressEmojis[stress - 1]}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Çok Rahat</span>
              <span>Çok Stresli</span>
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">
              Notlar (opsiyonel)
            </label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bugün neler hissettin?"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Ruh Hali Geçmişi</h3>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value={7}>Son 7 gün</option>
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Ortalama Ruh Hali</p>
              <p className="text-6xl mb-2">{moodEmojis[Math.round(parseFloat(averageMood)) - 1]}</p>
              <p className="text-lg font-semibold">{averageMood}/5</p>
            </div>

            <div className="space-y-3">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{moodEmojis[log.mood - 1]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium">
                          Ruh Hali: {log.mood}/5
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: tr })}
                        </p>
                      </div>
                      {log.stress && (
                        <p className="text-sm text-gray-600">
                          Stres: {stressEmojis[log.stress - 1]} {log.stress}/5
                        </p>
                      )}
                      {log.note && (
                        <p className="text-sm text-gray-700 mt-2">{log.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Henüz ruh hali kaydı yok. Yukarıdaki formdan ilk kaydınızı ekleyin!
          </p>
        )}
      </Card>
    </div>
  );
}
