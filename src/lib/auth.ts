import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// OAuth ayarlarını cache'le (her request'te DB'ye gitmemek için)
let oauthCache: {
  settings: any
  timestamp: number
} | null = null

const CACHE_TTL = 60000 // 1 dakika

async function getOAuthSettings() {
  const now = Date.now()
  
  // Cache varsa ve geçerli ise kullan
  if (oauthCache && (now - oauthCache.timestamp) < CACHE_TTL) {
    return oauthCache.settings
  }

  // Yeni ayarları getir
  const settings = await prisma.siteSettings.findFirst({
    orderBy: { updatedAt: "desc" },
    select: {
      googleOAuthEnabled: true,
      googleClientId: true,
      googleClientSecret: true,
      facebookOAuthEnabled: true,
      facebookAppId: true,
      facebookAppSecret: true,
    },
  })

  // Cache'e kaydet
  oauthCache = {
    settings,
    timestamp: now,
  }

  return settings
}

// Provider'ları dinamik olarak oluştur
async function buildProviders() {
  const settings = await getOAuthSettings()
  const providers: any[] = []

  // Google OAuth
  if (settings?.googleOAuthEnabled && settings.googleClientId && settings.googleClientSecret) {
    providers.push(
      GoogleProvider({
        clientId: settings.googleClientId,
        clientSecret: settings.googleClientSecret,
      })
    )
  }

  // Facebook OAuth
  if (settings?.facebookOAuthEnabled && settings.facebookAppId && settings.facebookAppSecret) {
    providers.push(
      FacebookProvider({
        clientId: settings.facebookAppId,
        clientSecret: settings.facebookAppSecret,
      })
    )
  }

  // Credentials Provider (her zaman aktif)
  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  )

  return providers
}

export const { handlers, signIn, signOut, auth } = NextAuth(async () => {
  const providers = await buildProviders()
  
  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    trustHost: true,
    pages: {
      signIn: "/login",
    },
    providers,
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, username: true }
          })
          token.role = dbUser?.role
          token.username = dbUser?.username
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.username = token.username as string | null
        }
        return session
      }
    }
  }
})

// Cache'i temizlemek için export edilen fonksiyon
export function clearOAuthCache() {
  oauthCache = null
}
