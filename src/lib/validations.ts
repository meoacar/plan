import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
})

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
})

export const planSchema = z.object({
  title: z.string().min(8, "Başlık en az 8 karakter olmalı").max(80, "Başlık en fazla 80 karakter olabilir"),
  startWeight: z.number().min(20, "Başlangıç kilosu en az 20 kg olmalı").max(400, "Başlangıç kilosu en fazla 400 kg olabilir"),
  goalWeight: z.number().min(20, "Hedef kilo en az 20 kg olmalı").max(400, "Hedef kilo en fazla 400 kg olabilir"),
  durationText: z.string().min(2, "Süre en az 2 karakter olmalı").max(32, "Süre en fazla 32 karakter olabilir"),
  routine: z.string().min(30, "Rutin en az 30 karakter olmalı").max(3000, "Rutin en fazla 3000 karakter olabilir"),
  diet: z.string().min(30, "Diyet en az 30 karakter olmalı").max(3000, "Diyet en fazla 3000 karakter olabilir"),
  exercise: z.string().min(30, "Egzersiz en az 30 karakter olmalı").max(3000, "Egzersiz en fazla 3000 karakter olabilir"),
  motivation: z.string().min(5, "Motivasyon en az 5 karakter olmalı").max(140, "Motivasyon en fazla 140 karakter olabilir"),
  imageUrl: z.string().url().optional().or(z.literal("")),
}).refine((data) => data.goalWeight < data.startWeight, {
  message: "Hedef kilo başlangıç kilosundan küçük olmalı",
  path: ["goalWeight"],
})

export const commentSchema = z.object({
  body: z.string().min(3, "Yorum en az 3 karakter olmalı").max(1000, "Yorum en fazla 1000 karakter olabilir"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı").max(50, "İsim en fazla 50 karakter olabilir"),
  bio: z.string().max(500, "Bio en fazla 500 karakter olabilir").optional(),
  startWeight: z.number().min(20).max(400).optional(),
  goalWeight: z.number().min(20).max(400).optional(),
})

// Admin Panel Validation Schemas
// Requirements: 3.7, 4.3, 5.3, 6.3

export const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalı").max(50, "Kategori adı en fazla 50 karakter olabilir"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalı").max(50, "Slug en fazla 50 karakter olabilir").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  description: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu girin (örn: #4caf50)"),
})

export const tagSchema = z.object({
  name: z.string().min(2, "Etiket adı en az 2 karakter olmalı").max(50, "Etiket adı en fazla 50 karakter olabilir"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalı").max(50, "Slug en fazla 50 karakter olabilir").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
})

export const bannedWordSchema = z.object({
  word: z.string().min(2, "Kelime en az 2 karakter olmalı").max(50, "Kelime en fazla 50 karakter olabilir").transform(val => val.toLowerCase()),
})

export const emailCampaignSchema = z.object({
  subject: z.string().min(5, "Konu en az 5 karakter olmalı").max(200, "Konu en fazla 200 karakter olabilir"),
  content: z.string().min(10, "İçerik en az 10 karakter olmalı"),
  recipients: z.enum(["ALL", "ADMIN", "USER"], {
    message: "Geçerli bir alıcı grubu seçin"
  }),
})

export const siteSettingsSchema = z.object({
  siteTitle: z.string().min(3, "Site başlığı en az 3 karakter olmalı").max(100, "Site başlığı en fazla 100 karakter olabilir"),
  siteDescription: z.string().min(10, "Site açıklaması en az 10 karakter olmalı").max(500, "Site açıklaması en fazla 500 karakter olabilir"),
  logoUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  footerText: z.string().optional(),
  footerAboutTitle: z.string().optional(),
  footerAboutText: z.string().optional(),
  footerLinksTitle: z.string().optional(),
  footerSocialTitle: z.string().optional(),
  maintenanceMode: z.boolean(),
  googleOAuthEnabled: z.boolean(),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  facebookOAuthEnabled: z.boolean(),
  facebookAppId: z.string().optional(),
  facebookAppSecret: z.string().optional(),
}).refine((data) => {
  if (data.googleOAuthEnabled) {
    return data.googleClientId && data.googleClientSecret
  }
  return true
}, {
  message: "Google OAuth aktifken Client ID ve Client Secret gereklidir",
  path: ["googleClientId"],
}).refine((data) => {
  if (data.facebookOAuthEnabled) {
    return data.facebookAppId && data.facebookAppSecret
  }
  return true
}, {
  message: "Facebook OAuth aktifken App ID ve App Secret gereklidir",
  path: ["facebookAppId"],
})
