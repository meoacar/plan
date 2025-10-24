"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecipeDetail({
  recipe,
  isLiked: initialIsLiked,
  currentUserId,
  recipeOwner,
  ownerRecipeCount,
}: any) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(recipe._count.likes);
  const [comments, setComments] = useState(recipe.comments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ingredients = JSON.parse(recipe.ingredients);

  // Görüntülenme sayısını artır (sadece bir kez)
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/recipes/${recipe.slug}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Görüntülenme sayma hatası:", error);
      }
    };

    trackView();
  }, [recipe.slug]);

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
        <div className={`mb-6 rounded-xl p-6 border-2 shadow-lg ${recipe.status === "PENDING"
            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
            : "bg-gradient-to-r from-red-50 to-pink-50 border-red-300"
          }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">
              {recipe.status === "PENDING" ? "⏳" : "❌"}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                {getStatusBadge()}
              </div>
              <p className={`text-base font-medium ${recipe.status === "PENDING" ? "text-yellow-900" : "text-red-900"
                }`}>
                {recipe.status === "PENDING" && (
                  <>
                    <strong>Bu tarif henüz admin onayı bekliyor.</strong>
                    <br />
                    <span className="text-sm">Tarifin incelendikten sonra yayınlanacak. Lütfen sabırlı olun.</span>
                  </>
                )}
                {recipe.status === "REJECTED" && (
                  <>
                    <strong>Bu tarif reddedildi.</strong>
                    <br />
                    <span className="text-sm">Aşağıdaki nedeni inceleyip tarifini düzenleyebilirsin.</span>
                  </>
                )}
              </p>
              {recipe.rejectionReason && (
                <div className="mt-4 rounded-lg bg-white/80 p-4 border-l-4 border-red-500">
                  <p className="text-sm font-semibold text-red-900 mb-1">📝 Red Nedeni:</p>
                  <p className="text-sm text-red-800">{recipe.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
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

        {/* Tarif Sahibi Bilgileri */}
        {recipeOwner && (
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-green-100 bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-center gap-5 p-5">
              <Link
                href={`/profile/${recipeOwner.username || recipeOwner.id}`}
                className="group relative flex-shrink-0"
              >
                {recipeOwner.image ? (
                  <div className="relative">
                    <img
                      src={recipeOwner.image}
                      alt={recipeOwner.name || ""}
                      className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md transition-all group-hover:scale-105 group-hover:border-green-400"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-md">
                      {recipeOwner.level}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-green-400 to-green-600 text-3xl font-bold text-white shadow-md transition-all group-hover:scale-105">
                      {recipeOwner.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-md">
                      {recipeOwner.level}
                    </div>
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <Link
                    href={`/profile/${recipeOwner.username || recipeOwner.id}`}
                    className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
                  >
                    {recipeOwner.name}
                  </Link>
                  <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                    Seviye {recipeOwner.level}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 shadow-sm">
                    <span className="text-lg">🍽️</span>
                    <span className="text-sm font-semibold text-gray-700">{ownerRecipeCount}</span>
                    <span className="text-xs text-gray-500">Tarif</span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 shadow-sm">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-semibold text-gray-700">{recipeOwner._count.plans}</span>
                    <span className="text-xs text-gray-500">Plan</span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 shadow-sm">
                    <span className="text-lg">✨</span>
                    <span className="text-sm font-semibold text-white">{recipeOwner.xp}</span>
                    <span className="text-xs text-white/90">XP</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/profile/${recipeOwner.username || recipeOwner.id}`}
                className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-green-700 hover:shadow-lg"
              >
                <span>Profili Gör</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}
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
                      className={`h-16 w-16 overflow-hidden rounded border-2 ${index === currentImageIndex
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
            className={`mt-4 w-full rounded-lg py-3 font-medium transition ${isLiked
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
