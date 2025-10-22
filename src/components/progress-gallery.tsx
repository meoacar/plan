'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Upload, X } from 'lucide-react';

interface ProgressPhoto {
  id: string;
  imageUrl: string;
  weight: number | null;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
}

interface ProgressGalleryProps {
  userId: string;
  isOwner: boolean;
}

export function ProgressGallery({ userId, isOwner }: ProgressGalleryProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/progress-photos?userId=${userId}`)
      .then((r) => r.json())
      .then(setPhotos);
  }, [userId]);

  const deletePhoto = async (id: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/progress-photos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPhotos(photos.filter((p) => p.id !== id));
      setSelectedPhoto(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || uploading) return;

    setUploading(true);
    try {
      // Önce dosyayı yükle
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload/progress-photo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        alert(error.error || 'Dosya yüklenirken hata oluştu');
        return;
      }

      const { url } = await uploadRes.json();

      // Sonra fotoğraf kaydını oluştur
      const payload: any = {
        imageUrl: url,
        isPublic,
      };
      if (weight) payload.weight = parseFloat(weight);
      if (description) payload.description = description;

      const res = await fetch('/api/progress-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newPhoto = await res.json();
        setPhotos([newPhoto, ...photos]);
        setSelectedFile(null);
        setPreviewUrl('');
        setWeight('');
        setDescription('');
        setIsPublic(true);
        setShowUpload(false);
      } else {
        alert('Fotoğraf eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fotoğraf eklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Önce/Sonra Galerisi</h2>
        {isOwner && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Upload size={20} />
            Fotoğraf Ekle
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center text-gray-500">
          Henüz fotoğraf eklenmemiş
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative cursor-pointer overflow-hidden rounded-lg"
            >
              <Image
                src={photo.imageUrl}
                alt="Progress"
                width={400}
                height={400}
                className="aspect-square object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100">
                <div className="absolute bottom-0 p-4 text-white">
                  {photo.weight && <p className="font-bold">{photo.weight} kg</p>}
                  <p className="text-sm">
                    {format(new Date(photo.createdAt), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUpload(false)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            <h3 className="mb-4 text-xl font-bold">Yeni Fotoğraf Ekle</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Fotoğraf Seç</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="w-full rounded-lg border px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maksimum dosya boyutu: 5MB
                </p>
              </div>

              {previewUrl && (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                  <Image
                    src={previewUrl}
                    alt="Önizleme"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Kilo (kg) - Opsiyonel</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="400"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75.5"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Açıklama (opsiyonel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bu fotoğraf hakkında..."
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Herkese açık yap (profilimde göster)</span>
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? 'Ekleniyor...' : 'Fotoğraf Ekle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            <Image
              src={selectedPhoto.imageUrl}
              alt="Progress"
              width={800}
              height={800}
              className="max-h-[70vh] w-auto rounded-lg"
            />
            <div className="mt-4">
              {selectedPhoto.weight && (
                <p className="text-xl font-bold text-green-600">{selectedPhoto.weight} kg</p>
              )}
              <p className="text-gray-600">
                {format(new Date(selectedPhoto.createdAt), 'dd MMMM yyyy', { locale: tr })}
              </p>
              {selectedPhoto.description && (
                <p className="mt-2 text-gray-700">{selectedPhoto.description}</p>
              )}
              {isOwner && (
                <button
                  onClick={() => deletePhoto(selectedPhoto.id)}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Sil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
