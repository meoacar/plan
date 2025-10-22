"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Measurement {
  id: string;
  chest?: number;
  waist?: number;
  hips?: number;
  thigh?: number;
  arm?: number;
  neck?: number;
  note?: string;
  createdAt: string;
}

export default function MeasurementTracker() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    chest: "",
    waist: "",
    hips: "",
    thigh: "",
    arm: "",
    neck: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [days, setDays] = useState(90);

  useEffect(() => {
    fetchMeasurements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch(`/api/analytics/measurements?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setMeasurements(data);
      }
    } catch (error) {
      console.error("Failed to fetch measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const payload: {
      chest?: number;
      waist?: number;
      hips?: number;
      thigh?: number;
      arm?: number;
      neck?: number;
      note?: string;
    } = {};
    if (formData.chest) payload.chest = parseFloat(formData.chest);
    if (formData.waist) payload.waist = parseFloat(formData.waist);
    if (formData.hips) payload.hips = parseFloat(formData.hips);
    if (formData.thigh) payload.thigh = parseFloat(formData.thigh);
    if (formData.arm) payload.arm = parseFloat(formData.arm);
    if (formData.neck) payload.neck = parseFloat(formData.neck);
    if (formData.note) payload.note = formData.note;

    if (Object.keys(payload).length === 0 || (Object.keys(payload).length === 1 && payload.note)) {
      alert("En az bir ölçüm girmelisiniz");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/analytics/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({
          chest: "",
          waist: "",
          hips: "",
          thigh: "",
          arm: "",
          neck: "",
          note: "",
        });
        fetchMeasurements();
      }
    } catch (error) {
      console.error("Failed to add measurement:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = measurements.map((m) => ({
    date: format(new Date(m.createdAt), "dd MMM", { locale: tr }),
    Göğüs: m.chest,
    Bel: m.waist,
    Kalça: m.hips,
    Uyluk: m.thigh,
    Kol: m.arm,
    Boyun: m.neck,
  }));

  const latestMeasurement = measurements[measurements.length - 1];
  const firstMeasurement = measurements[0];

  const calculateChange = (latest?: number, first?: number) => {
    if (!latest || !first) return null;
    const change = latest - first;
    return change;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Yeni Ölçüm Kaydı</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="chest" className="block text-sm font-medium mb-1">
                Göğüs (cm)
              </label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={formData.chest}
                onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                placeholder="95"
              />
            </div>

            <div>
              <label htmlFor="waist" className="block text-sm font-medium mb-1">
                Bel (cm)
              </label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={formData.waist}
                onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                placeholder="80"
              />
            </div>

            <div>
              <label htmlFor="hips" className="block text-sm font-medium mb-1">
                Kalça (cm)
              </label>
              <Input
                id="hips"
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={formData.hips}
                onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                placeholder="100"
              />
            </div>

            <div>
              <label htmlFor="thigh" className="block text-sm font-medium mb-1">
                Uyluk (cm)
              </label>
              <Input
                id="thigh"
                type="number"
                step="0.1"
                min="20"
                max="150"
                value={formData.thigh}
                onChange={(e) => setFormData({ ...formData, thigh: e.target.value })}
                placeholder="55"
              />
            </div>

            <div>
              <label htmlFor="arm" className="block text-sm font-medium mb-1">
                Kol (cm)
              </label>
              <Input
                id="arm"
                type="number"
                step="0.1"
                min="15"
                max="100"
                value={formData.arm}
                onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
                placeholder="30"
              />
            </div>

            <div>
              <label htmlFor="neck" className="block text-sm font-medium mb-1">
                Boyun (cm)
              </label>
              <Input
                id="neck"
                type="number"
                step="0.1"
                min="20"
                max="80"
                value={formData.neck}
                onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                placeholder="35"
              />
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">
              Not (opsiyonel)
            </label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ölçüm notları..."
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
          <h3 className="text-lg font-semibold">Ölçüm Grafiği</h3>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
            <option value={180}>Son 6 ay</option>
            <option value={365}>Son 1 yıl</option>
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : measurements.length > 0 ? (
          <>
            {latestMeasurement && firstMeasurement && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {latestMeasurement.waist && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Bel</p>
                    <p className="text-xl font-bold">{latestMeasurement.waist} cm</p>
                    {calculateChange(latestMeasurement.waist, firstMeasurement.waist) !== null && (
                      <p className={`text-sm ${calculateChange(latestMeasurement.waist, firstMeasurement.waist)! < 0 ? "text-green-600" : "text-red-600"}`}>
                        {calculateChange(latestMeasurement.waist, firstMeasurement.waist)! > 0 ? "+" : ""}
                        {calculateChange(latestMeasurement.waist, firstMeasurement.waist)!.toFixed(1)} cm
                      </p>
                    )}
                  </div>
                )}
                {latestMeasurement.hips && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Kalça</p>
                    <p className="text-xl font-bold">{latestMeasurement.hips} cm</p>
                    {calculateChange(latestMeasurement.hips, firstMeasurement.hips) !== null && (
                      <p className={`text-sm ${calculateChange(latestMeasurement.hips, firstMeasurement.hips)! < 0 ? "text-green-600" : "text-red-600"}`}>
                        {calculateChange(latestMeasurement.hips, firstMeasurement.hips)! > 0 ? "+" : ""}
                        {calculateChange(latestMeasurement.hips, firstMeasurement.hips)!.toFixed(1)} cm
                      </p>
                    )}
                  </div>
                )}
                {latestMeasurement.arm && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Kol</p>
                    <p className="text-xl font-bold">{latestMeasurement.arm} cm</p>
                    {calculateChange(latestMeasurement.arm, firstMeasurement.arm) !== null && (
                      <p className={`text-sm ${calculateChange(latestMeasurement.arm, firstMeasurement.arm)! < 0 ? "text-green-600" : "text-red-600"}`}>
                        {calculateChange(latestMeasurement.arm, firstMeasurement.arm)! > 0 ? "+" : ""}
                        {calculateChange(latestMeasurement.arm, firstMeasurement.arm)!.toFixed(1)} cm
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Bel" stroke="#2d7a4a" strokeWidth={2} />
                <Line type="monotone" dataKey="Kalça" stroke="#4caf50" strokeWidth={2} />
                <Line type="monotone" dataKey="Kol" stroke="#81c784" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Son Ölçümler</h4>
              {measurements.slice(-5).reverse().map((m) => (
                <div key={m.id} className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">
                      {format(new Date(m.createdAt), "dd MMM yyyy", { locale: tr })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {m.chest && <p>Göğüs: {m.chest} cm</p>}
                    {m.waist && <p>Bel: {m.waist} cm</p>}
                    {m.hips && <p>Kalça: {m.hips} cm</p>}
                    {m.thigh && <p>Uyluk: {m.thigh} cm</p>}
                    {m.arm && <p>Kol: {m.arm} cm</p>}
                    {m.neck && <p>Boyun: {m.neck} cm</p>}
                  </div>
                  {m.note && <p className="text-sm text-gray-600 mt-2">{m.note}</p>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Henüz ölçüm kaydı yok. Yukarıdaki formdan ilk kaydınızı ekleyin!
          </p>
        )}
      </Card>
    </div>
  );
}
