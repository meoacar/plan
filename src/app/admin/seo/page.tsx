"use client"

import { useState, useEffect } from "react"
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
// Toast için basit bir sistem kullanacağız

interface SeoSettings {
    sitemap: {
        enabled: boolean
        frequency: string
        priority: number
    }
    robots: {
        enabled: boolean
        allowAll: boolean
        customRules: string
    }
    rss: {
        enabled: boolean
        title: string
        description: string
        itemCount: number
    }
    openGraph: {
        enabled: boolean
        siteName: string
        defaultImage: string
        twitterCard: string
        twitterSite: string
    }
    google: {
        searchConsoleCode: string
        analyticsId: string
    }
}

export default function SeoPage() {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState<SeoSettings>({
        sitemap: {
            enabled: true,
            frequency: "daily",
            priority: 0.8
        },
        robots: {
            enabled: true,
            allowAll: true,
            customRules: ""
        },
        rss: {
            enabled: true,
            title: "Zayıflama Planım - RSS Feed",
            description: "En yeni zayıflama planları ve sağlıklı yaşam içerikleri",
            itemCount: 20
        },
        openGraph: {
            enabled: true,
            siteName: "Zayıflama Planım",
            defaultImage: "/og-image.jpg",
            twitterCard: "summary_large_image",
            twitterSite: "@zayiflamaplanim"
        },
        google: {
            searchConsoleCode: "",
            analyticsId: ""
        }
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const response = await fetch("/api/admin/seo")
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
            }
        } catch (error) {
            console.error("SEO ayarları yüklenemedi:", error)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                alert("SEO ayarları başarıyla kaydedildi")
            } else {
                alert("Kaydetme başarısız")
            }
        } catch (error) {
            alert("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const generateSitemap = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/seo/generate-sitemap", {
                method: "POST"
            })
            if (response.ok) {
                alert("Sitemap başarıyla oluşturuldu")
            } else {
                alert("Sitemap oluşturulamadı")
            }
        } catch (error) {
            alert("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <AdminBreadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">🌐 SEO Optimizasyonu</h1>
                    <p className="text-gray-600 mt-1">
                        Sitemap, robots.txt, RSS feed ve OpenGraph ayarlarını yönetin
                    </p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </div>

            <Tabs defaultValue="sitemap" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
                    <TabsTrigger value="robots">Robots.txt</TabsTrigger>
                    <TabsTrigger value="rss">RSS Feed</TabsTrigger>
                    <TabsTrigger value="opengraph">OpenGraph</TabsTrigger>
                    <TabsTrigger value="google">Google</TabsTrigger>
                </TabsList>

                <TabsContent value="sitemap" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sitemap Ayarları</CardTitle>
                            <CardDescription>
                                Arama motorları için XML sitemap yapılandırması
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="sitemap-enabled">Sitemap Etkin</Label>
                                <Switch
                                    id="sitemap-enabled"
                                    checked={settings.sitemap.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setSettings({
                                            ...settings,
                                            sitemap: { ...settings.sitemap, enabled: checked }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sitemap-frequency">Güncelleme Sıklığı</Label>
                                <select
                                    id="sitemap-frequency"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={settings.sitemap.frequency}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            sitemap: { ...settings.sitemap, frequency: e.target.value }
                                        })
                                    }
                                >
                                    <option value="always">Her Zaman</option>
                                    <option value="hourly">Saatlik</option>
                                    <option value="daily">Günlük</option>
                                    <option value="weekly">Haftalık</option>
                                    <option value="monthly">Aylık</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sitemap-priority">Öncelik (0.0 - 1.0)</Label>
                                <Input
                                    id="sitemap-priority"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={settings.sitemap.priority}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            sitemap: { ...settings.sitemap, priority: parseFloat(e.target.value) }
                                        })
                                    }
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <Button onClick={generateSitemap} disabled={loading} variant="outline">
                                    Sitemap Oluştur
                                </Button>
                                <p className="text-sm text-gray-500 mt-2">
                                    Sitemap: <a href="/sitemap.xml" target="_blank" className="text-blue-600 hover:underline">/sitemap.xml</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="robots" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Robots.txt Ayarları</CardTitle>
                            <CardDescription>
                                Arama motoru botları için erişim kuralları
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="robots-enabled">Robots.txt Etkin</Label>
                                <Switch
                                    id="robots-enabled"
                                    checked={settings.robots.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setSettings({
                                            ...settings,
                                            robots: { ...settings.robots, enabled: checked }
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="robots-allow-all">Tüm Botlara İzin Ver</Label>
                                <Switch
                                    id="robots-allow-all"
                                    checked={settings.robots.allowAll}
                                    onCheckedChange={(checked: boolean) =>
                                        setSettings({
                                            ...settings,
                                            robots: { ...settings.robots, allowAll: checked }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="robots-custom">Özel Kurallar</Label>
                                <Textarea
                                    id="robots-custom"
                                    rows={8}
                                    placeholder="User-agent: *&#10;Disallow: /admin/&#10;Disallow: /api/"
                                    value={settings.robots.customRules}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            robots: { ...settings.robots, customRules: e.target.value }
                                        })
                                    }
                                />
                                <p className="text-sm text-gray-500">
                                    Robots.txt: <a href="/robots.txt" target="_blank" className="text-blue-600 hover:underline">/robots.txt</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rss" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>RSS Feed Ayarları</CardTitle>
                            <CardDescription>
                                RSS feed yapılandırması ve içerik ayarları
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="rss-enabled">RSS Feed Etkin</Label>
                                <Switch
                                    id="rss-enabled"
                                    checked={settings.rss.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setSettings({
                                            ...settings,
                                            rss: { ...settings.rss, enabled: checked }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rss-title">Feed Başlığı</Label>
                                <Input
                                    id="rss-title"
                                    value={settings.rss.title}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            rss: { ...settings.rss, title: e.target.value }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rss-description">Feed Açıklaması</Label>
                                <Textarea
                                    id="rss-description"
                                    rows={3}
                                    value={settings.rss.description}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            rss: { ...settings.rss, description: e.target.value }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rss-count">Gösterilecek İçerik Sayısı</Label>
                                <Input
                                    id="rss-count"
                                    type="number"
                                    min="5"
                                    max="100"
                                    value={settings.rss.itemCount}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            rss: { ...settings.rss, itemCount: parseInt(e.target.value) }
                                        })
                                    }
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-500">
                                    RSS Feed: <a href="/rss.xml" target="_blank" className="text-blue-600 hover:underline">/rss.xml</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="opengraph" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>OpenGraph & Twitter Card Ayarları</CardTitle>
                            <CardDescription>
                                Sosyal medya paylaşımları için meta tag yapılandırması
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="og-enabled">OpenGraph Etkin</Label>
                                <Switch
                                    id="og-enabled"
                                    checked={settings.openGraph.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setSettings({
                                            ...settings,
                                            openGraph: { ...settings.openGraph, enabled: checked }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="og-sitename">Site Adı</Label>
                                <Input
                                    id="og-sitename"
                                    value={settings.openGraph.siteName}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            openGraph: { ...settings.openGraph, siteName: e.target.value }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="og-image">Varsayılan Görsel URL</Label>
                                <Input
                                    id="og-image"
                                    placeholder="/og-image.jpg"
                                    value={settings.openGraph.defaultImage}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            openGraph: { ...settings.openGraph, defaultImage: e.target.value }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter-card">Twitter Card Tipi</Label>
                                <select
                                    id="twitter-card"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={settings.openGraph.twitterCard}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            openGraph: { ...settings.openGraph, twitterCard: e.target.value }
                                        })
                                    }
                                >
                                    <option value="summary">Summary</option>
                                    <option value="summary_large_image">Summary Large Image</option>
                                    <option value="app">App</option>
                                    <option value="player">Player</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter-site">Twitter Kullanıcı Adı</Label>
                                <Input
                                    id="twitter-site"
                                    placeholder="@zayiflamaplanim"
                                    value={settings.openGraph.twitterSite}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            openGraph: { ...settings.openGraph, twitterSite: e.target.value }
                                        })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="google" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Google Search Console & Analytics</CardTitle>
                            <CardDescription>
                                Google doğrulama kodları ve Analytics entegrasyonu
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-semibold text-blue-900">📋 Google Search Console Kurulum</h3>
                                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                                    <li>
                                        <a 
                                            href="https://search.google.com/search-console" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            Google Search Console
                                        </a> sayfasına gidin
                                    </li>
                                    <li>Site URL'nizi ekleyin ve "HTML tag" doğrulama yöntemini seçin</li>
                                    <li>Verilen meta tag'deki <code className="bg-blue-100 px-1 rounded">content</code> değerini kopyalayın</li>
                                    <li>Aşağıdaki alana yapıştırın ve kaydedin</li>
                                    <li>Google Search Console'a dönüp "Doğrula" butonuna tıklayın</li>
                                </ol>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="google-search-console">
                                    Google Search Console Doğrulama Kodu
                                </Label>
                                <Input
                                    id="google-search-console"
                                    placeholder="örn: abc123xyz456..."
                                    value={settings.google.searchConsoleCode}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            google: { ...settings.google, searchConsoleCode: e.target.value }
                                        })
                                    }
                                />
                                <p className="text-xs text-gray-500">
                                    Meta tag: <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        &lt;meta name="google-site-verification" content="BURAYA_KOD" /&gt;
                                    </code>
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="google-analytics">
                                        Google Analytics ID (Opsiyonel)
                                    </Label>
                                    <Input
                                        id="google-analytics"
                                        placeholder="örn: G-XXXXXXXXXX veya UA-XXXXXXXXX-X"
                                        value={settings.google.analyticsId}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                google: { ...settings.google, analyticsId: e.target.value }
                                            })
                                        }
                                    />
                                    <p className="text-xs text-gray-500">
                                        Google Analytics 4 (GA4) veya Universal Analytics ID'nizi girin
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">✅ Doğrulama Sonrası</h4>
                                <p className="text-sm text-green-800">
                                    Doğrulama başarılı olduktan sonra Google Search Console'da sitenizin performansını, 
                                    arama sorgularını ve indeksleme durumunu takip edebilirsiniz.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
