"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecipeDetail({
  recipe,
  isLiked: initialIsLiked,
  currentUserId,
}: any) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(recipe._count.likes);
  const [comments, setComments] = useState(recipe.comments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ingredients = JSON.parse(recipe.ingredients);

  const handleLike = async () => {
    if (!currentUserId) {
      alert("Beğenmek için giriş yapmalısınız");
      return;
    }

    try {
      const res = await fetch(`/api/recipes/${recipe.slug}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikeCount((prev: number) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Beğeni hatası:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Yorum yapmak için giriş yapmalısınız");
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/recipes/${recipe.slug}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Yorum hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (recipe.status) {
      case "PENDING":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            ⏳ Onay Bekliyor
          </span>
        );
      case "REJECTED":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            ❌ Reddedildi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Durum Badge'i (Admin veya kendi tarifi için) */}
      {recipe.status !== "APPROVED" && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-sm text-gray-700">
              {recipe.status === "PENDING" && "Bu tarif henüz admin onayı bekliyor"}
              {recipe.status === "REJECTED" && "Bu tarif reddedildi"}
            </span>
          </div>
          {recipe.rejectionReason && (
            <div className="mt-2 text-sm text-red-700">
              <strong>Red Nedeni:</strong> {recipe.rejectionReason}
            </div>
          )}
        </div>
      )}

      {/* Başlık */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {recipe.category}
          </span>
          {recipe.difficulty && (
            <span className="text-sm text-gray-600">{recipe.difficulty}</span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{recipe.title}</h1>
        <p className="mt-3 text-lg text-gray-600">{recipe.description}</p>
      </div>

      {/* İstatistikler */}
      <div className="mb-6 flex flex-wrap items-center gap-6 border-b pb-6">
        {recipe.prepTime && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            <div>
              <div className="text-sm text-gray-600">Toplam Süre</div>
              <div className="font-semibold">
                {recipe.prepTime + (recipe.cookTime || 0)} dakika
              </div>
            </div>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <div>
              <div className="text-sm text-gray-600">Porsiyon</div>
              <div className="font-semibold">{recipe.servings} kişilik</div>
            </div>
          </div>
        )}
        {recipe.calories && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-sm text-gray-600">Kalori</div>
              <div className="font-semibold">
                {Math.round(recipe.calories)} kcal
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-2xl">👁️</span>
          <div>
            <div className="text-sm text-gray-600">Görüntülenme</div>
            <div className="font-semibold">{recipe.views}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sol Kolon - Resimler ve Besin Değerleri */}
        <div className="lg:col-span-1">
          {/* Resim Galerisi */}
          {recipe.images.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={recipe.images[currentImageIndex].url}
                  alt={recipe.title}
                  className="h-full w-full object-cover"
                />
                {recipe.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? recipe.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === recipe.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              {recipe.images.length > 1 && (
                <div className="mt-2 flex gap-2">
                  {recipe.images.map((img: any, index: number) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-16 w-16 overflow-hidden rounded border-2 ${
                        index === currentImageIndex
                          ? "border-green-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Resim ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Besin Değerleri */}
          {(recipe.protein || recipe.carbs || recipe.fat) && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">
                Besin Değerleri (Porsiyon Başı)
              </h3>
              <div className="space-y-2 text-sm">
                {recipe.protein && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium">{recipe.protein}g</span>
                  </div>
                )}
                {recipe.carbs && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Karbonhidrat</span>
                    <span className="font-medium">{recipe.carbs}g</span>
                  </div>
                )}
                {recipe.fat && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yağ</span>
                    <span className="font-medium">{recipe.fat}g</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Beğen Butonu */}
          <button
            onClick={handleLike}
            className={`mt-4 w-full rounded-lg py-3 font-medium transition ${
              isLiked
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isLiked ? "❤️" : "🤍"} {likeCount} Beğeni
          </button>
        </div>

        {/* Sağ Kolon - Malzemeler ve Yapılış */}
        <div className="lg:col-span-2">
          {/* Malzemeler */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Malzemeler
            </h2>
            <ul className="space-y-2">
              {ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Yapılış */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Yapılışı</h2>
            <div className="whitespace-pre-wrap text-gray-700">
              {recipe.instructions}
            </div>
          </div>

          {/* Yorumlar */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Yorumlar ({comments.length})
            </h2>

            {currentUserId && (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  rows={3}
                  className="w-full rounded-lg border px-4 py-2"
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="mt-2 rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Gönderiliyor..." : "Yorum Yap"}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-3">
                    {comment.user.image && (
                      <img
                        src={comment.user.image}
                        alt={comment.user.name || ""}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{comment.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-gray-500">
                  Henüz yorum yapılmamış
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
