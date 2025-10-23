"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminRecipeList({
  status,
  page,
}: {
  status?: string;
  page: number;
}) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [status, page]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page.toString());

      const res = await fetch(`/api/admin/recipes?${params}`);
      const data = await res.json();

      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Tarif listesi hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recipeId: string) => {
    if (!confirm("Bu tarifi onaylamak istediğinizden emin misiniz?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/recipes/${recipeId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Tarif onaylandı!");
        fetchRecipes();
      } else {
        alert("Bir hata oluştu");
      }
    } catch (error) {
      console.error("Onaylama hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRecipe) return;

    if (!rejectionReason.trim()) {
      alert("Red nedeni belirtmelisiniz");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/recipes/${selectedRecipe.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (res.ok) {
        alert("Tarif reddedildi!");
        setSelectedRecipe(null);
        setRejectionReason("");
        fetchRecipes();
      } else {
        alert("Bir hata oluştu");
      }
    } catch (error) {
      console.error("Reddetme hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            Bekliyor
          </span>
        );
      case "APPROVED":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Onaylı
          </span>
        );
      case "REJECTED":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            Reddedildi
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div>
      {/* Filtreler */}
      <div className="mb-6 flex gap-2">
        <Link
          href="/admin/recipes"
          className={`rounded-lg px-4 py-2 font-medium ${
            !status
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tümü
        </Link>
        <Link
          href="/admin/recipes?status=PENDING"
          className={`rounded-lg px-4 py-2 font-medium ${
            status === "PENDING"
              ? "bg-yellow-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Bekleyenler
        </Link>
        <Link
          href="/admin/recipes?status=APPROVED"
          className={`rounded-lg px-4 py-2 font-medium ${
            status === "APPROVED"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Onaylılar
        </Link>
        <Link
          href="/admin/recipes?status=REJECTED"
          className={`rounded-lg px-4 py-2 font-medium ${
            status === "REJECTED"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Reddedilenler
        </Link>
      </div>

      {/* Tarif Listesi */}
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex gap-4 rounded-lg border bg-white p-4"
          >
            {recipe.images[0] && (
              <img
                src={recipe.images[0].url}
                alt={recipe.title}
                className="h-32 w-32 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {recipe.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {recipe.description}
                  </p>
                </div>
                {getStatusBadge(recipe.status)}
              </div>

              <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="rounded bg-gray-100 px-2 py-1">
                  {recipe.category}
                </span>
                {recipe.difficulty && <span>{recipe.difficulty}</span>}
                {recipe.prepTime && (
                  <span>
                    ⏱️ {recipe.prepTime + (recipe.cookTime || 0)} dk
                  </span>
                )}
                {recipe.servings && <span>👥 {recipe.servings} kişilik</span>}
                <span>❤️ {recipe._count.likes}</span>
                <span>💬 {recipe._count.comments}</span>
              </div>

              {recipe.rejectionReason && (
                <div className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">
                  <strong>Red Nedeni:</strong> {recipe.rejectionReason}
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/recipes/${recipe.slug}`}
                  target="_blank"
                  className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Görüntüle
                </Link>

                {recipe.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(recipe.id)}
                      disabled={actionLoading}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      disabled={actionLoading}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </>
                )}

                {recipe.status === "REJECTED" && (
                  <button
                    onClick={() => handleApprove(recipe.id)}
                    disabled={actionLoading}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Onayla
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {recipes.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Tarif bulunamadı
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/admin/recipes?page=${p}${status ? `&status=${status}` : ""}`}
                className={`rounded px-4 py-2 ${
                  p === page
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p}
              </Link>
            )
          )}
        </div>
      )}

      {/* Red Nedeni Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Tarifi Reddet
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              <strong>{selectedRecipe.title}</strong> tarifini neden
              reddediyorsunuz?
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Red nedenini yazın..."
              rows={4}
              className="mb-4 w-full rounded-lg border px-4 py-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 rounded-lg bg-red-600 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "İşleniyor..." : "Reddet"}
              </button>
              <button
                onClick={() => {
                  setSelectedRecipe(null);
                  setRejectionReason("");
                }}
                disabled={actionLoading}
                className="rounded-lg border px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
