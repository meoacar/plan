"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePollForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    allowMultiple: false,
    duration: "7", // gün cinsinden
    options: ["", ""],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = formData.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert("En az 2 seçenek girmelisiniz");
      return;
    }

    if (!formData.question.trim()) {
      alert("Soru alanı zorunludur");
      return;
    }

    setIsSubmitting(true);

    try {
      // Bitiş tarihini hesapla
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + parseInt(formData.duration));

      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          description: formData.description || undefined,
          allowMultiple: formData.allowMultiple,
          endsAt: endsAt.toISOString(),
          options: validOptions,
        }),
      });

      if (res.ok) {
        router.push("/polls");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Anket oluşturulamadı");
      }
    } catch (error) {
      console.error("Create poll error:", error);
      alert("Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-6">
        {/* Soru */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Soru <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Örn: Hangi diyet yöntemini tercih ediyorsunuz?"
            maxLength={200}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.question.length}/200 karakter
          </p>
        </div>

        {/* Açıklama */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Açıklama (Opsiyonel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Anketiniz hakkında kısa bir açıklama..."
            rows={3}
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 karakter
          </p>
        </div>

        {/* Süre */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Anket Süresi
          </label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="1">1 Gün</option>
            <option value="3">3 Gün</option>
            <option value="7">1 Hafta</option>
            <option value="14">2 Hafta</option>
            <option value="30">1 Ay</option>
            <option value="90">3 Ay</option>
          </select>
        </div>

        {/* Seçenekler */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Seçenekler <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder={`Seçenek ${index + 1}`}
                  maxLength={100}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="rounded-lg border border-red-300 bg-red-50 px-4 text-red-600 hover:bg-red-100"
                  >
                    Sil
                  </button>
                )}
              </div>
            ))}
          </div>
          {formData.options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
            >
              + Seçenek Ekle
            </button>
          )}
          <p className="mt-2 text-xs text-gray-500">
            En az 2, en fazla 10 seçenek ekleyebilirsiniz
          </p>
        </div>

        {/* Çoklu Seçim */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <input
            type="checkbox"
            id="allowMultiple"
            checked={formData.allowMultiple}
            onChange={(e) => setFormData({ ...formData, allowMultiple: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="allowMultiple" className="text-sm font-medium text-gray-700">
            Kullanıcılar birden fazla seçenek işaretleyebilsin
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Oluşturuluyor..." : "Anketi Oluştur"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </div>
    </form>
  );
}
