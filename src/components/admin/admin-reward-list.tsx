"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Reward {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  stock: number | null;
  digitalData: any;
  physicalData: any;
  premiumData: any;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  purchaseCount: number;
  inStock: boolean;
}

interface RewardFormData {
  type: string;
  category: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

interface Stats {
  total: number;
  active: number;
  sold: number;
  revenue: number;
}

const REWARD_TYPES = [
  { value: "BADGE", label: "Rozet" },
  { value: "THEME", label: "Tema" },
  { value: "AVATAR", label: "Avatar" },
  { value: "FRAME", label: "Çerçeve" },
  { value: "DISCOUNT_CODE", label: "İndirim Kodu" },
  { value: "GIFT_CARD", label: "Hediye Çeki" },
  { value: "AD_FREE", label: "Reklamsız" },
  { value: "PREMIUM_STATS", label: "Premium İstatistikler" },
  { value: "CUSTOM_PROFILE", label: "Özel Profil" },
];

const REWARD_CATEGORIES = [
  { value: "DIGITAL", label: "Dijital" },
  { value: "PHYSICAL", label: "Fiziksel" },
  { value: "PREMIUM", label: "Premium" },
];

export default function AdminRewardList() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, sold: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");

  const [formData, setFormData] = useState<RewardFormData>({
    type: "BADGE",
    category: "DIGITAL",
    name: "",
    description: "",
    imageUrl: "",
    price: 100,
    stock: null,
    isActive: true,
    isFeatured: false,
    order: 0,
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rewards, filterCategory, filterType, filterActive]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rewards");
      if (!response.ok) throw new Error("Ödüller getirilemedi");
      const result = await response.json();
      setRewards(result.data.rewards);
      setStats(result.data.stats);
    } catch (error) {
      console.error("Ödülleri getirme hatası:", error);
      alert("Ödüller yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rewards];

    if (filterCategory !== "all") {
      filtered = filtered.filter((r) => r.category === filterCategory);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((r) => r.type === filterType);
    }

    if (filterActive !== "all") {
      filtered = filtered.filter((r) =>
        filterActive === "active" ? r.isActive : !r.isActive
      );
    }

    setFilteredRewards(filtered);
  };

  const handleCreate = async () => {
    try {
      // Validasyon
      if (!formData.name || !formData.description) {
        alert("Lütfen tüm gerekli alanları doldurun");
        return;
      }

      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Ödül oluşturulamadı");

      alert("Ödül başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchRewards();
    } catch (error) {
      console.error("Ödül oluşturma hatası:", error);
      alert("Ödül oluşturulurken bir hata oluştu");
    }
  };

  const handleEdit = async () => {
    if (!selectedReward) return;

    try {
      const response = await fetch(`/api/admin/rewards/${selectedReward.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Ödül güncellenemedi");

      alert("Ödül başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedReward(null);
      resetForm();
      fetchRewards();
    } catch (error) {
      console.error("Ödül güncelleme hatası:", error);
      alert("Ödül güncellenirken bir hata oluştu");
    }
  };

  const handleDelete = async () => {
    if (!selectedReward) return;

    try {
      const response = await fetch(`/api/admin/rewards/${selectedReward.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Ödül silinemedi");

      const data = await response.json();
      alert(data.message || "Ödül başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedReward(null);
      fetchRewards();
    } catch (error) {
      console.error("Ödül silme hatası:", error);
      alert("Ödül silinirken bir hata oluştu");
    }
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      const response = await fetch(`/api/admin/rewards/${reward.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !reward.isActive }),
      });

      if (!response.ok) throw new Error("Durum değiştirilemedi");

      alert(
        reward.isActive ? "Ödül pasif hale getirildi" : "Ödül aktif hale getirildi"
      );
      fetchRewards();
    } catch (error) {
      console.error("Durum değiştirme hatası:", error);
      alert("Durum değiştirilirken bir hata oluştu");
    }
  };

  const handleToggleFeatured = async (reward: Reward) => {
    try {
      const response = await fetch(`/api/admin/rewards/${reward.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !reward.isFeatured }),
      });

      if (!response.ok) throw new Error("Öne çıkarma durumu değiştirilemedi");

      alert(
        reward.isFeatured ? "Ödül öne çıkarılmadı" : "Ödül öne çıkarıldı"
      );
      fetchRewards();
    } catch (error) {
      console.error("Öne çıkarma hatası:", error);
      alert("Öne çıkarma durumu değiştirilirken bir hata oluştu");
    }
  };

  const openEditDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setFormData({
      type: reward.type,
      category: reward.category,
      name: reward.name,
      description: reward.description,
      imageUrl: reward.imageUrl || "",
      price: reward.price,
      stock: reward.stock,
      isActive: reward.isActive,
      isFeatured: reward.isFeatured,
      order: reward.order,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: "BADGE",
      category: "DIGITAL",
      name: "",
      description: "",
      imageUrl: "",
      price: 100,
      stock: null,
      isActive: true,
      isFeatured: false,
      order: 0,
    });
  };

  const getTypeLabel = (type: string) => {
    return REWARD_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getCategoryLabel = (category: string) => {
    return REWARD_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7a4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Ödüller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header ve Filtreler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ödül Yönetimi</CardTitle>
            <Button
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-[#2d7a4a] hover:bg-[#236038]"
            >
              ➕ Yeni Ödül Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kategori</Label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Tümü</option>
                {REWARD_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Ödül Tipi</Label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Tümü</option>
                {REWARD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Durum</Label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#2d7a4a]">{stats.total}</p>
              <p className="text-sm text-gray-600">Toplam Ödül</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
              <p className="text-sm text-gray-600">Aktif Ödül</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.sold}</p>
              <p className="text-sm text-gray-600">Satılan Ödül</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Toplam Gelir (Coin)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ödül Listesi */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRewards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Ödül bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          filteredRewards.map((reward) => (
            <Card key={reward.id} className={!reward.isActive ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Ödül Görseli */}
                  <div className="flex-shrink-0">
                    {reward.imageUrl ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={reward.imageUrl}
                          alt={reward.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-4xl">
                        🎁
                      </div>
                    )}
                  </div>

                  {/* Ödül Bilgileri */}
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="font-bold text-lg">{reward.name}</h3>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{getCategoryLabel(reward.category)}</Badge>
                      <Badge variant="outline">{getTypeLabel(reward.type)}</Badge>
                      <Badge className="bg-yellow-500">💰 {reward.price} Coin</Badge>
                      {reward.stock !== null && (
                        <Badge variant="outline">
                          📦 Stok: {reward.stock}
                        </Badge>
                      )}
                      {reward.stock === null && (
                        <Badge variant="outline" className="bg-green-100">
                          ♾️ Sınırsız
                        </Badge>
                      )}
                      {reward.isActive ? (
                        <Badge className="bg-green-500">✅ Aktif</Badge>
                      ) : (
                        <Badge className="bg-gray-500">❌ Pasif</Badge>
                      )}
                      {reward.isFeatured && (
                        <Badge className="bg-purple-500">⭐ Öne Çıkan</Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <span>
                        📊 {reward.purchaseCount} satış • Sıra: {reward.order}
                      </span>
                    </div>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(reward)}
                    >
                      {reward.isActive ? "Pasif Yap" : "Aktif Yap"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleFeatured(reward)}
                    >
                      {reward.isFeatured ? "Öne Çıkarma" : "Öne Çıkar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(reward)}
                    >
                      ✏️ Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(reward)}
                    >
                      🗑️ Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ödül Oluşturma Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Ödül Oluştur</DialogTitle>
            <DialogDescription>
              Mağazada satılacak yeni bir ödül oluşturun
            </DialogDescription>
          </DialogHeader>

          <RewardForm formData={formData} setFormData={setFormData} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-[#2d7a4a] hover:bg-[#236038]"
            >
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ödül Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ödül Düzenle</DialogTitle>
            <DialogDescription>Ödül bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>

          <RewardForm formData={formData} setFormData={setFormData} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-[#2d7a4a] hover:bg-[#236038]"
            >
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödülü Sil</DialogTitle>
            <DialogDescription>
              Bu ödülü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              {selectedReward && selectedReward.purchaseCount > 0 && (
                <p className="mt-2 text-orange-600 font-semibold">
                  ⚠️ Bu ödül {selectedReward.purchaseCount} kez satın alınmış. Silme
                  yerine pasif hale getirilecek.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Bileşeni
function RewardForm({
  formData,
  setFormData,
}: {
  formData: RewardFormData;
  setFormData: React.Dispatch<React.SetStateAction<RewardFormData>>;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Kategori *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-2 border rounded-md"
          >
            {REWARD_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="type">Ödül Tipi *</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="w-full p-2 border rounded-md"
          >
            {REWARD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Ödül Adı *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Örn: Altın Rozet"
        />
      </div>

      <div>
        <Label htmlFor="description">Açıklama *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Ödül açıklaması"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Görsel URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.png"
        />
        <p className="text-xs text-gray-500 mt-1">
          Ödül görseli için URL girin (opsiyonel)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Fiyat (Coin) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseInt(e.target.value) || 0,
              })
            }
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="stock">Stok</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            min="0"
            placeholder="Boş = Sınırsız"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="order">Sıralama</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
          }
          min="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          Düşük sayılar önce gösterilir
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Aktif
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) =>
              setFormData({ ...formData, isFeatured: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="isFeatured" className="cursor-pointer">
            Öne Çıkan
          </Label>
        </div>
      </div>
    </div>
  );
}
