"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  Users, 
  Star,
  Eye,
  EyeOff,
  Loader2,
  Trash2
} from "lucide-react";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface MicroCopy {
  id: string;
  key: string;
  location: string;
  text: string;
  isActive: boolean;
}

interface UserStory {
  id: string;
  name: string;
  beforeWeight?: number;
  afterWeight?: number;
  duration?: string;
  story: string;
  quote?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

interface PromoSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  order: number;
  isActive: boolean;
}

export default function PromoManagementPage() {
  const [activeTab, setActiveTab] = useState("features");

  const tabs = [
    { id: "features", label: "Özellikler", icon: Sparkles },
    { id: "microcopy", label: "Mikro Kopyalar", icon: MessageSquare },
    { id: "stories", label: "Kullanıcı Hikayeleri", icon: Users },
    { id: "sections", label: "Bölümler", icon: Star },
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
        {activeTab === "features" && <FeaturesTab />}
        {activeTab === "microcopy" && <MicroCopyTab />}
        {activeTab === "stories" && <StoriesTab />}
        {activeTab === "sections" && <SectionsTab />}
      </div>
    </div>
  );
}

function FeaturesTab() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await fetch("/api/admin/promo/features");
      const data = await res.json();
      setFeatures(data);
    } catch (error) {
      console.error("Error fetching features:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/promo/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchFeatures();
    } catch (error) {
      console.error("Error toggling feature:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Özellikler ({features.length})</h2>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İkon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map((feature) => (
              <tr key={feature.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-2xl">{feature.icon === "target" ? "🎯" : feature.icon === "message" ? "💬" : feature.icon === "utensils" ? "🍽️" : "⚡"}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{feature.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md">{feature.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {feature.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${feature.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {feature.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleActive(feature.id, feature.isActive)}
                    className="text-gray-600 hover:text-gray-900 mr-3"
                  >
                    {feature.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MicroCopyTab() {
  const [microcopies, setMicrocopies] = useState<MicroCopy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMicrocopies();
  }, []);

  const fetchMicrocopies = async () => {
    try {
      const res = await fetch("/api/admin/promo/microcopy");
      const data = await res.json();
      setMicrocopies(data);
    } catch (error) {
      console.error("Error fetching microcopies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mikro Kopyalar ({microcopies.length})</h2>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {microcopies.map((copy) => (
              <tr key={copy.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{copy.key}</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {copy.location}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md">{copy.text}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${copy.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {copy.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StoriesTab() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/admin/promo/stories");
      const data = await res.json();
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/promo/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchStories();
    } catch (error) {
      console.error("Error toggling story:", error);
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/admin/promo/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      fetchStories();
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm("Bu hikayeyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await fetch(`/api/admin/promo/stories/${id}`, {
        method: "DELETE",
      });
      fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Kullanıcı Hikayeleri ({stories.length})</h2>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kilo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Süre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hikaye</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stories.map((story) => (
              <tr key={story.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{story.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {story.beforeWeight && story.afterWeight && (
                    <span>{story.beforeWeight}kg → {story.afterWeight}kg</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {story.duration}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md truncate">{story.story}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFeatured(story.id, story.isFeatured)}
                      className="text-gray-600 hover:text-yellow-500"
                      title={story.isFeatured ? "Öne Çıkarmayı Kaldır" : "Öne Çıkar"}
                    >
                      <Star className={`w-4 h-4 ${story.isFeatured ? "text-yellow-500 fill-yellow-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => toggleActive(story.id, story.isActive)}
                      className="text-gray-600 hover:text-gray-900"
                      title={story.isActive ? "Pasif Yap" : "Aktif Yap"}
                    >
                      {story.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteStory(story.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${story.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {story.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionsTab() {
  const [sections, setSections] = useState<PromoSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/admin/promo/sections");
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/promo/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchSections();
    } catch (error) {
      console.error("Error toggling section:", error);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Bu bölümü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await fetch(`/api/admin/promo/sections/${id}`, {
        method: "DELETE",
      });
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tanıtım Bölümleri ({sections.length})</h2>
        <a
          href="/admin/promo/sections/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Yeni Bölüm
        </a>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alt Başlık</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sections.map((section) => (
              <tr key={section.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                    {section.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{section.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md truncate">{section.subtitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {section.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${section.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {section.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a
                    href={`/admin/promo/sections/${section.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-3 inline-block"
                    title="Düzenle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </a>
                  <button
                    onClick={() => toggleActive(section.id, section.isActive)}
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    title={section.isActive ? "Pasif Yap" : "Aktif Yap"}
                  >
                    {section.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
