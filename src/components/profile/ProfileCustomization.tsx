"use client";

import { useState, useEffect } from "react";

type CustomizationType = "FRAME" | "BACKGROUND" | "THEME" | "BADGE" | "ANIMATION";

interface CustomizationItem {
  id: string;
  type: CustomizationType;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  previewUrl: string | null;
  cssClass: string | null;
  colors: any;
  unlockCondition: string;
  isUnlocked: boolean;
  isActive: boolean;
  isSpecial: boolean;
}

interface CustomizationData {
  customization: any;
  items: CustomizationItem[];
  badgeCount: number;
}

export default function ProfileCustomization() {
  const [data, setData] = useState<CustomizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CustomizationType>("FRAME");
  const [selectedItems, setSelectedItems] = useState({
    frame: null as string | null,
    background: null as string | null,
    theme: null as string | null,
    badges: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      const res = await fetch("/api/profile/customization");
      const json = await res.json();
      setData(json);

      // Aktif öğeleri set et
      setSelectedItems({
        frame: json.customization?.activeFrame || null,
        background: json.customization?.activeBackground || null,
        theme: json.customization?.activeTheme || null,
        badges: json.customization?.activeBadges || [],
      });
    } catch (error) {
      console.error("Error fetching customization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/customization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeFrame: selectedItems.frame,
          activeBackground: selectedItems.background,
          activeTheme: selectedItems.theme,
          activeBadges: selectedItems.badges,
        }),
      });

      if (res.ok) {
        await fetchCustomization();
        alert("Özelleştirmeler kaydedildi!");
      }
    } catch (error) {
      console.error("Error saving customization:", error);
      alert("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  const handleItemSelect = (type: CustomizationType, code: string) => {
    if (type === "FRAME") {
      setSelectedItems({ ...selectedItems, frame: code });
    } else if (type === "BACKGROUND") {
      setSelectedItems({ ...selectedItems, background: code });
    } else if (type === "THEME") {
      setSelectedItems({ ...selectedItems, theme: code });
    } else if (type === "BADGE") {
      const badges = selectedItems.badges.includes(code)
        ? selectedItems.badges.filter((b) => b !== code)
        : selectedItems.badges.length < 3
        ? [...selectedItems.badges, code]
        : selectedItems.badges;
      setSelectedItems({ ...selectedItems, badges });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-center">Veri yüklenemedi</div>;
  }

  const tabs = [
    { type: "FRAME" as CustomizationType, label: "Çerçeveler", icon: "🖼️" },
    { type: "BACKGROUND" as CustomizationType, label: "Arka Planlar", icon: "🎨" },
    { type: "THEME" as CustomizationType, label: "Temalar", icon: "🎭" },
    { type: "BADGE" as CustomizationType, label: "Rozetler", icon: "⭐" },
  ];

  const currentItems = data.items.filter((item) => item.type === activeTab);
  const unlockedCount = currentItems.filter((item) => item.isUnlocked).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Profil Özelleştirme
        </h2>
        <p className="text-gray-600">
          Rozetler kazanarak özel çerçeveler, arka planlar ve temalar aç!
        </p>
        <div className="mt-2 text-sm text-emerald-600 font-medium">
          🏆 {data.badgeCount} rozet kazandın
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.type
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Açılan Öğeler
          </span>
          <span className="text-sm font-bold text-emerald-600">
            {unlockedCount} / {currentItems.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{
              width: `${(unlockedCount / currentItems.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {currentItems.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              item.isUnlocked && handleItemSelect(item.type, item.code)
            }
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
              item.isUnlocked
                ? item.isActive ||
                  (item.type === "FRAME" &&
                    selectedItems.frame === item.code) ||
                  (item.type === "BACKGROUND" &&
                    selectedItems.background === item.code) ||
                  (item.type === "THEME" &&
                    selectedItems.theme === item.code) ||
                  (item.type === "BADGE" &&
                    selectedItems.badges.includes(item.code))
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
                : "border-gray-200 opacity-50 cursor-not-allowed"
            }`}
          >
            {!item.isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                <span className="text-4xl">🔒</span>
              </div>
            )}

            {item.isSpecial && item.isUnlocked && (
              <div className="absolute top-2 right-2">
                <span className="text-xl">✨</span>
              </div>
            )}

            <div className="text-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 mx-auto mb-2 object-contain"
                />
              ) : item.colors?.gradient ? (
                <div
                  className="w-16 h-16 mx-auto mb-2 rounded-lg"
                  style={{ background: item.colors.gradient }}
                ></div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg"></div>
              )}

              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                {item.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {item.description}
              </p>

              {!item.isUnlocked && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  {item.unlockCondition}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
