"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CheckInForm() {
  const [formData, setFormData] = useState({
    weight: "",
    energy: 3,
    motivation: 3,
    sleep: "",
    water: "",
    exercise: false,
    dietPlan: false,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const payload: {
        energy: number;
        motivation: number;
        exercise: boolean;
        dietPlan: boolean;
        weight?: number;
        sleep?: number;
        water?: number;
        note?: string;
      } = {
        energy: formData.energy,
        motivation: formData.motivation,
        exercise: formData.exercise,
        dietPlan: formData.dietPlan,
      };

      if (formData.weight) payload.weight = parseFloat(formData.weight);
      if (formData.sleep) payload.sleep = parseFloat(formData.sleep);
      if (formData.water) payload.water = parseInt(formData.water);
      if (formData.note) payload.note = formData.note;

      const res = await fetch("/api/analytics/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          weight: "",
          energy: 3,
          motivation: 3,
          sleep: "",
          water: "",
          exercise: false,
          dietPlan: false,
          note: "",
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to submit check-in:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Günlük Check-In</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium mb-1">
              Kilo (kg) - Opsiyonel
            </label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="400"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="75.5"
            />
          </div>

          <div>
            <label htmlFor="sleep" className="block text-sm font-medium mb-1">
              Uyku (saat) - Opsiyonel
            </label>
            <Input
              id="sleep"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.sleep}
              onChange={(e) => setFormData({ ...formData, sleep: e.target.value })}
              placeholder="8"
            />
          </div>
        </div>

        <div>
          <label htmlFor="water" className="block text-sm font-medium mb-1">
            Su Tüketimi (bardak) - Opsiyonel
          </label>
          <Input
            id="water"
            type="number"
            min="0"
            max="30"
            value={formData.water}
            onChange={(e) => setFormData({ ...formData, water: e.target.value })}
            placeholder="8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Enerji Seviyesi: {formData.energy}/5
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.energy}
            onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Çok Düşük</span>
            <span>Harika</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Motivasyon: {formData.motivation}/5
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Çok Düşük</span>
            <span>Çok Yüksek</span>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.exercise}
              onChange={(e) => setFormData({ ...formData, exercise: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Egzersiz yaptım</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.dietPlan}
              onChange={(e) => setFormData({ ...formData, dietPlan: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Diyet planına uydum</span>
          </label>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium mb-1">
            Notlar (opsiyonel)
          </label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Bugün nasıl geçti?"
            rows={3}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Kaydediliyor..." : "Check-In Yap"}
        </Button>

        {success && (
          <p className="text-green-600 text-center text-sm">
            ✓ Check-in başarıyla kaydedildi!
          </p>
        )}
      </form>
    </Card>
  );
}
