"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: { votes: number };
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  isActive: boolean;
  allowMultiple: boolean;
  endsAt?: string;
  creator: { id: string; name: string };
  options: PollOption[];
  _count: { votes: number };
  createdAt: string;
}

export default function PollManagement({ initialPolls }: { initialPolls: Poll[] }) {
  const router = useRouter();
  const [polls, setPolls] = useState(initialPolls);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    allowMultiple: false,
    endsAt: "",
    options: ["", ""],
  });

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = formData.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert("En az 2 seçenek girmelisiniz");
      return;
    }

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          options: validOptions,
          endsAt: formData.endsAt || undefined,
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFormData({ question: "", description: "", allowMultiple: false, endsAt: "", options: ["", ""] });
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Anket oluşturulamadı");
      }
    } catch (error) {
      console.error("Create poll error:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleToggleActive = async (pollId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm("Bu anketi silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/polls/${pollId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete poll error:", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="mb-6 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
      >
        {showCreateForm ? "İptal" : "+ Yeni Anket"}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreatePoll} className="mb-8 rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Yeni Anket Oluştur</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Soru *</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full rounded-lg border p-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border p-2"
                rows={2}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Seçenekler *</label>
              {formData.options.map((option, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="flex-1 rounded-lg border p-2"
                    placeholder={`Seçenek ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = formData.options.filter((_, i) => i !== index);
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="rounded-lg border px-3 text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  )}
                </div>
              ))}
              {formData.options.length < 10 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, options: [...formData.options, ""] })}
                  className="mt-2 text-sm text-green-600 hover:underline"
                >
                  + Seçenek Ekle
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allowMultiple}
                  onChange={(e) => setFormData({ ...formData, allowMultiple: e.target.checked })}
                />
                <span className="text-sm">Çoklu seçim</span>
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Bitiş Tarihi (Opsiyonel)</label>
              <input
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="rounded-lg border p-2"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Anketi Oluştur
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {polls.map((poll) => (
          <div key={poll.id} className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{poll.question}</h3>
                {poll.description && (
                  <p className="mt-1 text-sm text-gray-600">{poll.description}</p>
                )}
                <div className="mt-2 flex gap-2 text-xs text-gray-500">
                  <span>Oluşturan: {poll.creator.name}</span>
                  <span>•</span>
                  <span>{poll._count.votes} oy</span>
                  {poll.allowMultiple && (
                    <>
                      <span>•</span>
                      <span>Çoklu seçim</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(poll.id, poll.isActive)}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    poll.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {poll.isActive ? "Aktif" : "Pasif"}
                </button>
                <button
                  onClick={() => handleDeletePoll(poll.id)}
                  className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                >
                  Sil
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
                  <span className="text-sm">{option.text}</span>
                  <span className="text-sm font-medium text-gray-600">
                    {option._count.votes} oy
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
