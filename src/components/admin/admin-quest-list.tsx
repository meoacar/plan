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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Quest {
  id: string;
  type: "DAILY" | "WEEKLY" | "SPECIAL";
  category: string;
  title: string;
  description: string;
  icon: string;
  targetType: string;
  targetValue: number;
  coinReward: number;
  xpReward: number;
  isActive: boolean;
  priority: number;
  conditions: any;
  createdAt: string;
  updatedAt: string;
  totalAssigned?: number;
  totalCompleted?: number;
  completionRate?: number;
}

interface QuestFormData {
  type: "DAILY" | "WEEKLY" | "SPECIAL";
  category: string;
  title: string;
  description: string;
  icon: string;
  targetType: string;
  targetValue: number;
  coinReward: number;
  xpReward: number;
  isActive: boolean;
  priority: number;
}

const QUEST_TYPES = [
  { value: "DAILY", label: "Günlük" },
  { value: "WEEKLY", label: "Haftalık" },
  { value: "SPECIAL", label: "Özel" },
];

const QUEST_CATEGORIES = [
  { value: "PLAN", label: "Plan" },
  { value: "RECIPE", label: "Tarif" },
  { value: "SOCIAL", label: "Sosyal" },
  { value: "ACTIVITY", label: "Aktivite" },
];

const TARGET_TYPES = [
  { value: "CREATE_PLAN", label: "Plan Oluştur" },
  { value: "APPROVE_PLAN", label: "Plan Onayla" },
  { value: "LIKE_COUNT", label: "Beğeni Sayısı" },
  { value: "COMMENT_COUNT", label: "Yorum Sayısı" },
  { value: "CREATE_RECIPE", label: "Tarif Oluştur" },
  { value: "DAILY_LOGIN", label: "Günlük Giriş" },
  { value: "WEIGHT_LOG", label: "Kilo Kaydı" },
  { value: "CHECK_IN", label: "Check-in" },
  { value: "FOLLOW_USER", label: "Kullanıcı Takip Et" },
  { value: "VIEW_PLANS", label: "Plan Görüntüle" },
];

export default function AdminQuestList() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");

  const [formData, setFormData] = useState<QuestFormData>({
    type: "DAILY",
    category: "PLAN",
    title: "",
    description: "",
    icon: "🎯",
    targetType: "CREATE_PLAN",
    targetValue: 1,
    coinReward: 10,
    xpReward: 10,
    isActive: true,
    priority: 0,
  });

  useEffect(() => {
    fetchQuests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quests, filterType, filterCategory, filterActive]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/quests");
      if (!response.ok) throw new Error("Görevler getirilemedi");
      const data = await response.json();
      setQuests(data.quests);
    } catch (error) {
      console.error("Görevleri getirme hatası:", error);
      alert("Görevler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quests];

    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.type === filterType);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((q) => q.category === filterCategory);
    }

    if (filterActive !== "all") {
      filtered = filtered.filter((q) =>
        filterActive === "active" ? q.isActive : !q.isActive
      );
    }

    setFilteredQuests(filtered);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Görev oluşturulamadı");

      alert("Görev başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchQuests();
    } catch (error) {
      console.error("Görev oluşturma hatası:", error);
      alert("Görev oluşturulurken bir hata oluştu");
    }
  };

  const handleEdit = async () => {
    if (!selectedQuest) return;

    try {
      const response = await fetch(`/api/admin/quests/${selectedQuest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Görev güncellenemedi");

      alert("Görev başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedQuest(null);
      resetForm();
      fetchQuests();
    } catch (error) {
      console.error("Görev güncelleme hatası:", error);
      alert("Görev güncellenirken bir hata oluştu");
    }
  };

  const handleDelete = async () => {
    if (!selectedQuest) return;

    try {
      const response = await fetch(`/api/admin/quests/${selectedQuest.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Görev silinemedi");

      const data = await response.json();
      alert(data.message || "Görev başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedQuest(null);
      fetchQuests();
    } catch (error) {
      console.error("Görev silme hatası:", error);
      alert("Görev silinirken bir hata oluştu");
    }
  };

  const handleToggleActive = async (quest: Quest) => {
    try {
      const response = await fetch(`/api/admin/quests/${quest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !quest.isActive }),
      });

      if (!response.ok) throw new Error("Durum değiştirilemedi");

      alert(
        quest.isActive ? "Görev pasif hale getirildi" : "Görev aktif hale getirildi"
      );
      fetchQuests();
    } catch (error) {
      console.error("Durum değiştirme hatası:", error);
      alert("Durum değiştirilirken bir hata oluştu");
    }
  };

  const openEditDialog = (quest: Quest) => {
    setSelectedQuest(quest);
    setFormData({
      type: quest.type,
      category: quest.category,
      title: quest.title,
      description: quest.description,
      icon: quest.icon,
      targetType: quest.targetType,
      targetValue: quest.targetValue,
      coinReward: quest.coinReward,
      xpReward: quest.xpReward,
      isActive: quest.isActive,
      priority: quest.priority,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: "DAILY",
      category: "PLAN",
      title: "",
      description: "",
      icon: "🎯",
      targetType: "CREATE_PLAN",
      targetValue: 1,
      coinReward: 10,
      xpReward: 10,
      isActive: true,
      priority: 0,
    });
  };

  const getTypeLabel = (type: string) => {
    return QUEST_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getCategoryLabel = (category: string) => {
    return QUEST_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const getTargetTypeLabel = (targetType: string) => {
    return TARGET_TYPES.find((t) => t.value === targetType)?.label || targetType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7a4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Görevler yükleniyor...</p>
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
            <CardTitle>Görev Yönetimi</CardTitle>
            <Button
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-[#2d7a4a] hover:bg-[#236038]"
            >
              ➕ Yeni Görev Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Görev Tipi</Label>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <SelectItem value="all">Tümü</SelectItem>
                {QUEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Label>Kategori</Label>
              <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <SelectItem value="all">Tümü</SelectItem>
                {QUEST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Label>Durum</Label>
              <Select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#2d7a4a]">{quests.length}</p>
              <p className="text-sm text-gray-600">Toplam Görev</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {quests.filter((q) => q.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Aktif Görev</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {quests.filter((q) => q.type === "DAILY").length}
              </p>
              <p className="text-sm text-gray-600">Günlük Görev</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {quests.filter((q) => q.type === "WEEKLY").length}
              </p>
              <p className="text-sm text-gray-600">Haftalık Görev</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Görev Listesi */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Görev bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuests.map((quest) => (
            <Card key={quest.id} className={!quest.isActive ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{quest.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{quest.title}</h3>
                        <p className="text-sm text-gray-600">{quest.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{getTypeLabel(quest.type)}</Badge>
                      <Badge variant="outline">{getCategoryLabel(quest.category)}</Badge>
                      <Badge variant="outline">
                        {getTargetTypeLabel(quest.targetType)}: {quest.targetValue}
                      </Badge>
                      <Badge className="bg-yellow-500">💰 {quest.coinReward} Coin</Badge>
                      <Badge className="bg-blue-500">⭐ {quest.xpReward} XP</Badge>
                      {quest.isActive ? (
                        <Badge className="bg-green-500">✅ Aktif</Badge>
                      ) : (
                        <Badge className="bg-gray-500">❌ Pasif</Badge>
                      )}
                    </div>

                    {quest.totalAssigned !== undefined && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span>
                          📊 {quest.totalAssigned} atama • {quest.totalCompleted} tamamlama
                          • %{quest.completionRate} tamamlanma oranı
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(quest)}
                    >
                      {quest.isActive ? "Pasif Yap" : "Aktif Yap"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(quest)}
                    >
                      ✏️ Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(quest)}
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

      {/* Görev Oluşturma Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
            <DialogDescription>
              Kullanıcılara atanacak yeni bir görev oluşturun
            </DialogDescription>
          </DialogHeader>

          <QuestForm formData={formData} setFormData={setFormData} />

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

      {/* Görev Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Görev Düzenle</DialogTitle>
            <DialogDescription>Görev bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>

          <QuestForm formData={formData} setFormData={setFormData} />

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
            <DialogTitle>Görevi Sil</DialogTitle>
            <DialogDescription>
              Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              {selectedQuest && selectedQuest.totalAssigned && selectedQuest.totalAssigned > 0 && (
                <p className="mt-2 text-orange-600 font-semibold">
                  ⚠️ Bu görev {selectedQuest.totalAssigned} kullanıcıya atanmış. Silme
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
function QuestForm({
  formData,
  setFormData,
}: {
  formData: QuestFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestFormData>>;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Görev Tipi *</Label>
          <Select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as "DAILY" | "WEEKLY" | "SPECIAL" })
            }
          >
            {QUEST_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Kategori *</Label>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            {QUEST_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Başlık *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Örn: 3 Plan Oluştur"
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
          placeholder="Görev açıklaması"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="icon">İkon</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🎯"
          />
        </div>

        <div>
          <Label htmlFor="priority">Öncelik</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetType">Hedef Tipi *</Label>
          <Select
            id="targetType"
            value={formData.targetType}
            onChange={(e) =>
              setFormData({ ...formData, targetType: e.target.value })
            }
          >
            {TARGET_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="targetValue">Hedef Değer *</Label>
          <Input
            id="targetValue"
            type="number"
            value={formData.targetValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                targetValue: parseInt(e.target.value) || 1,
              })
            }
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="coinReward">Coin Ödülü</Label>
          <Input
            id="coinReward"
            type="number"
            value={formData.coinReward}
            onChange={(e) =>
              setFormData({
                ...formData,
                coinReward: parseInt(e.target.value) || 0,
              })
            }
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="xpReward">XP Ödülü</Label>
          <Input
            id="xpReward"
            type="number"
            value={formData.xpReward}
            onChange={(e) =>
              setFormData({
                ...formData,
                xpReward: parseInt(e.target.value) || 0,
              })
            }
            min="0"
          />
        </div>
      </div>

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
    </div>
  );
}
