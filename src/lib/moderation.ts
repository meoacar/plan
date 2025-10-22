import { prisma } from "./prisma"

interface ModerationResult {
  isClean: boolean
  bannedWords: string[]
  isSpam: boolean
}

/**
 * İçeriği yasaklı kelimeler ve spam kontrolünden geçirir
 * Requirements: 4.4, 4.5
 */
export async function checkContent(text: string): Promise<ModerationResult> {
  if (!text || text.trim().length === 0) {
    return {
      isClean: true,
      bannedWords: [],
      isSpam: false,
    }
  }

  // Yasaklı kelimeleri veritabanından al
  const bannedWordsFromDb = await prisma.bannedWord.findMany({
    select: { word: true },
  })

  // İçeriği küçük harfe çevir
  const lowerText = text.toLowerCase()

  // Yasaklı kelimeleri kontrol et
  const foundBannedWords = bannedWordsFromDb
    .filter((bw: { word: string }) => lowerText.includes(bw.word.toLowerCase()))
    .map((bw: { word: string }) => bw.word)

  // Spam tespiti
  const isSpam = detectSpam(text)

  return {
    isClean: foundBannedWords.length === 0 && !isSpam,
    bannedWords: foundBannedWords,
    isSpam,
  }
}

/**
 * Basit spam tespit algoritması
 */
function detectSpam(text: string): boolean {
  // Aşırı tekrarlanan karakterler (örn: "aaaaa", "!!!!!")
  const repeatedCharsPattern = /(.)\1{4,}/g
  if (repeatedCharsPattern.test(text)) {
    return true
  }

  // Aşırı büyük harf kullanımı (metinin %70'inden fazlası büyük harf)
  const upperCaseCount = (text.match(/[A-ZÇĞİÖŞÜ]/g) || []).length
  const letterCount = (text.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ]/g) || []).length
  if (letterCount > 10 && upperCaseCount / letterCount > 0.7) {
    return true
  }

  // Aşırı link içeriği
  const urlPattern = /(https?:\/\/[^\s]+)/g
  const urls = text.match(urlPattern) || []
  if (urls.length > 3) {
    return true
  }

  // Çok kısa ve anlamsız içerik (sadece emoji veya özel karakterler)
  const meaningfulChars = text.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]/g, "")
  if (text.length > 10 && meaningfulChars.length < 5) {
    return true
  }

  return false
}
