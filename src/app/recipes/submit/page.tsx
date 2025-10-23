"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Ana Yemek",
  "Çorba",
  "Salata",
  "Tatlı",
  "Atıştırmalık",
  "İçecek",
];

const DIFFICULTIES = ["Kolay", "Orta", "Zor"];

export default function SubmitRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "Orta",
    category: "Ana Yemek",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("En az 1 resim yüklemelisiniz");
      return;
    }

    if (images.length > 5) {
      alert("En fazla 5 resim yükleyebilirsiniz");
      return;
    }

    const filteredIngredients = ingredients.filter((i) => i.trim());
    if (filteredIngredients.length === 0) {
      alert("En az 1 malzeme eklemelisiniz");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ingredients: filteredIngredients,
          images,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Bir hata oluştu");
      }

      alert("Tarifiniz başarıyla gönderildi! Admin onayından sonra yayınlanacak.");
      router.push("/recipes");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      alert("En fazla 5 resim yükleyebilirsiniz");
      return;
    }

    setUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/recipe", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Yükleme başarısız");
        }

        const data = await res.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      alert("Resim yüklenirken bir hata oluştu");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tarif Paylaş</h1>
        <p className="mt-2 text-gray-600">
          Sağlıklı yemek tarifini topluluğumuzla paylaş
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Tarif Başlığı *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Örn: Izgara Tavuklu Kinoa Salatası"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Açıklama *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Tarifin kısa açıklaması..."
          />
        </div>

        {/* Kategori ve Zorluk */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Kategori *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Zorluk
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Süre ve Porsiyon */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Hazırlık (dk)
            </label>
            <input
              type="number"
              min="0"
              value={formData.prepTime}
              onChange={(e) =>
                setFormData({ ...formData, prepTime: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Pişirme (dk)
            </label>
            <input
              type="number"
              min="0"
              value={formData.cookTime}
              onChange={(e) =>
                setFormData({ ...formData, cookTime: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Porsiyon
            </label>
            <input
              type="number"
              min="1"
              value={formData.servings}
              onChange={(e) =>
                setFormData({ ...formData, servings: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>
        </div>

        {/* Besin Değerleri */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">
            Besin Değerleri (Porsiyon Başı - Opsiyonel)
          </h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-gray-700">
                Kalori (kcal)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-700">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.protein}
                onChange={(e) =>
                  setFormData({ ...formData, protein: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-700">
                Karbonhidrat (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData({ ...formData, carbs: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-700">
                Yağ (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.fat}
                onChange={(e) =>
                  setFormData({ ...formData, fat: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Malzemeler */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Malzemeler *
          </label>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 rounded-lg border px-4 py-2"
                  placeholder="Örn: 2 su bardağı kinoa"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                  >
                    Sil
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 text-sm text-green-600 hover:text-green-700"
          >
            + Malzeme Ekle
          </button>
        </div>

        {/* Yapılış */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Yapılışı *
          </label>
          <textarea
            required
            value={formData.instructions}
            onChange={(e) =>
              setFormData({ ...formData, instructions: e.target.value })
            }
            rows={8}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Adım adım tarif yapılışını yazın..."
          />
        </div>

        {/* Resim Yükleme */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Resimler * (En az 1, en fazla 5)
          </label>
          <div className="rounded-lg border-2 border-dashed p-6 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage || images.length >= 5}
              className="hidden"
              id="recipe-images"
            />
            <label
              htmlFor="recipe-images"
              className={`inline-block cursor-pointer rounded-lg px-6 py-3 font-medium ${
                uploadingImage || images.length >= 5
                  ? "bg-gray-300 text-gray-500"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {uploadingImage ? "Yükleniyor..." : "Resim Seç"}
            </label>
            <p className="mt-2 text-sm text-gray-500">
              {images.length}/5 resim yüklendi
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Bilgisayarınızdan veya mobil cihazınızdan resim seçin
            </p>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Resim ${index + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gönder */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Tarifi Gönder"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
