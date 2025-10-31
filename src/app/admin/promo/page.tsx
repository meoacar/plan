"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Video, 
  Sparkles, 
  MessageSquare, 
  Users, 
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

export default function PromoManagementPage() {
  const [activeTab, setActiveTab] = useState("sections");

  const tabs = [
    { id: "sections", label: "Tanıtım Bölümleri", icon: Video },
    { id: "features", label: "Özellikler", icon: Sparkles },
    { id: "microcopy", label: "Mikro Kopyalar", icon: MessageSquare },
    { id: "stories", label: "Kullanıcı Hikayeleri", icon: Users },
    { id: "testimonials", label: "Referanslar", icon: Star },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tanıtım Yönetimi</h1>
        <p className="text-gray-600">
          Sitenin tanıtım içeriklerini buradan yönetebilirsiniz
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === "sections" && <SectionsTab />}
        {activeTab === "features" && <FeaturesTab />}
        {activeTab === "microcopy" && <MicroCopyTab />}
        {activeTab === "stories" && <StoriesTab />}
        {activeTab === "testimonials" && <TestimonialsTab />}
      </div>
    </div>
  );
}

function SectionsTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tanıtım Bölümleri</h2>
        <Link
          href="/admin/promo/sections/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Bölüm
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 text-gray-500 text-center">
          Bölümler yükleniyor...
        </div>
      </div>
    </div>
  );
}

function FeaturesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Özellikler</h2>
        <Link
          href="/admin/promo/features/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Özellik
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 text-gray-500 text-center">
          Özellikler yükleniyor...
        </div>
      </div>
    </div>
  );
}

function MicroCopyTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mikro Kopyalar</h2>
        <Link
          href="/admin/promo/microcopy/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Mikro Kopy
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 text-gray-500 text-center">
          Mikro kopyalar yükleniyor...
        </div>
      </div>
    </div>
  );
}

function StoriesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Kullanıcı Hikayeleri</h2>
        <Link
          href="/admin/promo/stories/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Hikaye
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 text-gray-500 text-center">
          Hikayeler yükleniyor...
        </div>
      </div>
    </div>
  );
}

function TestimonialsTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Referanslar</h2>
        <Link
          href="/admin/promo/testimonials/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Referans
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 text-gray-500 text-center">
          Referanslar yükleniyor...
        </div>
      </div>
    </div>
  );
}
