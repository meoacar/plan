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

  const fetchCustomization = async (resetSelection = true) => {
    try {
      const res = await fetch("/api/profile/customization");
      const json = await res.json();
      setData(json);

      // Aktif öğeleri set et
      if (resetSelection) {
        setSelectedItems({
          frame: json.customization?.activeFrame || null,
          background: json.customization?.activeBackground || null,
          theme: json.customization?.activeTheme || null,
          badges: json.customization?.activeBadges || [],
        });
      }
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
        const result = await res.json();
        // Kaydedilen değerleri state'e yansıt
        setSelectedItems({
          frame: result.customization.activeFrame || null,
          background: result.customization.activeBackground || null,
          theme: result.customization.activeTheme || null,
          badges: result.customization.activeBadges || [],
        });
        // Veriyi güncelle ama seçimleri sıfırlama
        await fetchCustomization(false);
        alert("Özelleştirmeler kaydedildi!");
      } else {
        const error = await res.json();
        alert("Bir hata oluştu: " + (error.error || "Bilinmeyen hata"));
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-block mb-4">
          <div className="relative">
            <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Profil Özelleştirme
            </h2>
            <div className="absolute -top-2 -right-8 text-4xl animate-bounce">✨</div>
          </div>
        </div>
        <p className="text-gray-600 text-lg mb-4">
          Rozetler kazanarak özel çerçeveler, arka planlar ve temalar aç!
        </p>
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full shadow-lg">
          <span className="text-2xl">🏆</span>
          <span className="font-bold text-lg">{data.badgeCount} Rozet Kazandın</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`group relative px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.type
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-102"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-2xl transition-transform duration-300 ${
                activeTab === tab.type ? "scale-110" : "group-hover:scale-110"
              }`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </div>
            {activeTab === tab.type && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="text-lg font-bold text-gray-800">
              Açılan Öğeler
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-md">
            <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {unlockedCount} / {currentItems.length}
            </span>
          </div>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${(unlockedCount / currentItems.length) * 100}%`,
            }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm font-semibold text-gray-600">
            {Math.round((unlockedCount / currentItems.length) * 100)}% Tamamlandı
          </span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {currentItems.map((item) => {
          const isSelected =
            item.isActive ||
            (item.type === "FRAME" && selectedItems.frame === item.code) ||
            (item.type === "BACKGROUND" && selectedItems.background === item.code) ||
            (item.type === "THEME" && selectedItems.theme === item.code) ||
            (item.type === "BADGE" && selectedItems.badges.includes(item.code));

          return (
            <div
              key={item.id}
              onClick={() =>
                item.isUnlocked && handleItemSelect(item.type, item.code)
              }
              className={`group relative rounded-2xl overflow-hidden transition-all duration-500 ${
                item.isUnlocked
                  ? isSelected
                    ? "ring-4 ring-emerald-500 shadow-2xl scale-105"
                    : "ring-2 ring-gray-200 hover:ring-emerald-400 hover:shadow-xl hover:scale-102 cursor-pointer"
                  : "ring-2 ring-gray-200 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Background Preview for Themes */}
              {item.type === "THEME" && item.colors && (
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: item.colors.gradient || 
                      `linear-gradient(135deg, ${item.colors.primary || '#10b981'} 0%, ${item.colors.secondary || '#3b82f6'} 50%, ${item.colors.accent || '#8b5cf6'} 100%)`
                  }}
                ></div>
              )}

              {/* Lock Overlay */}
              {!item.isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-900/60 backdrop-blur-sm z-10">
                  <div className="text-6xl mb-3 animate-pulse">🔒</div>
                  <p className="text-white text-sm font-bold px-4 text-center">
                    {item.unlockCondition}
                  </p>
                </div>
              )}

              {/* Special Badge */}
              {item.isSpecial && item.isUnlocked && (
                <div className="absolute top-3 right-3 z-20">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg animate-pulse">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && item.isUnlocked && (
                <div className="absolute top-3 left-3 z-20">
                  <div className="bg-emerald-500 rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-6 bg-white/90 backdrop-blur-sm">
                {/* Preview */}
                <div className="mb-4 flex items-center justify-center">
                  {item.type === "THEME" && item.colors ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-lg">
                      <div
                        className="absolute inset-0 animate-gradient"
                        style={{
                          background: item.colors.gradient || 
                            `linear-gradient(135deg, ${item.colors.primary || '#10b981'} 0%, ${item.colors.secondary || '#3b82f6'} 50%, ${item.colors.accent || '#8b5cf6'} 100%)`,
                          backgroundSize: '200% 200%',
                        }}
                      ></div>
                      {/* Mini Profile Preview */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/40"></div>
                            <div className="space-y-1">
                              <div className="w-16 h-2 bg-white/60 rounded"></div>
                              <div className="w-12 h-1.5 bg-white/40 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Color Dots */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: item.colors.primary || '#10b981' }}></div>
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: item.colors.secondary || '#3b82f6' }}></div>
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: item.colors.accent || '#8b5cf6' }}></div>
                      </div>
                    </div>
                  ) : item.previewUrl || item.imageUrl ? (
                    <img
                      src={item.previewUrl || item.imageUrl}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : item.colors?.gradient ? (
                    <div
                      className="w-24 h-24 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-500"
                      style={{ background: item.colors.gradient }}
                    ></div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-500"></div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  {/* Action Hint */}
                  {item.isUnlocked && (
                    <div className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isSelected ? "✓ Seçildi" : "Tıkla ve Seç"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative px-12 py-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative flex items-center gap-3">
            {saving ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">💾</span>
                <span>Değişiklikleri Kaydet</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
