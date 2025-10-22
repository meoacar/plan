"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Image from "next/image";

interface ProgressPhoto {
  id: string;
  imageUrl: string;
  weight?: number;
  description?: string;
  isPublic: boolean;
  createdAt: string;
}

export default function ProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/analytics/photos");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || submitting) return;

    setSubmitting(true);
    try {
      const payload: {
        imageUrl: string;
        isPublic: boolean;
        weight?: number;
        description?: string;
      } = {
        imageUrl,
        isPublic,
      };
      if (weight) payload.weight = parseFloat(weight);
      if (description) payload.description = description;

      const res = await fetch("/api/analytics/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setImageUrl("");
        setWeight("");
        setDescription("");
        setIsPublic(false);
        fetchPhotos();
      }
    } catch (error) {
      console.error("Failed to add photo:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu fotoğrafı silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/analytics/photos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPhotos();
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Yeni Fotoğraf Ekle</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
              Fotoğraf URL
            </label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://i.imgur.com/..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Imgur, Cloudinary veya ImgBB gibi servislere yükleyip URL'yi buraya yapıştırın
            </p>
          </div>

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
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.5"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Açıklama (opsiyonel)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu fotoğraf hakkında..."
              rows={2}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Herkese açık yap (profilimde göster)</span>
          </label>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Ekleniyor..." : "Fotoğraf Ekle"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Fotoğraf Timeline</h3>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.description || "İlerleme fotoğrafı"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(photo.createdAt), "dd MMM yyyy", { locale: tr })}
                      </p>
                      {photo.weight && (
                        <p className="font-semibold">{photo.weight} kg</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${photo.isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {photo.isPublic ? "Herkese Açık" : "Özel"}
                    </span>
                  </div>
                  {photo.description && (
                    <p className="text-sm text-gray-700 mb-3">{photo.description}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(photo.id)}
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Henüz fotoğraf yok. Yukarıdaki formdan ilk fotoğrafınızı ekleyin!
          </p>
        )}
      </Card>
    </div>
  );
}
