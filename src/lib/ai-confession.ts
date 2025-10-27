// AI Confession Reply Generator
// Basit pattern matching ile esprili yanıtlar üretir

interface FoodPattern {
  keywords: string[];
  replies: string[];
}

const foodPatterns: FoodPattern[] = [
  {
    keywords: ['pasta', 'kek', 'tatlı', 'baklava', 'künefe', 'sütlaç', 'tiramisu'],
    replies: [
      'Tatlı, hayatın acı taraflarını unutturmak içindir. Sen doğru yaptın.',
      'O noktada artık "dilim" değil "destan" yazmışsın.',
      'Tatlının suçu yok, senin empati sınırların zorlanmış.',
      'Şeker, beynin mutluluk hormonudur. Bilimsel bir karar vermişsin.',
      'Tatlı yemek günah değil, yaşam biçimidir.',
    ],
  },
  {
    keywords: ['pizza', 'hamburger', 'fast food', 'mcdonalds', 'burger king', 'kfc'],
    replies: [
      'Fast food, hızlı mutluluktur. Yavaş pişman olursun ama değer.',
      'İsmini unutan çok olur, ama patates seni asla unutmaz.',
      'Hamburger, modern çağın en dürüst yemeğidir. Gizli bir şey yok.',
      'Drive-thru\'dan geçmek, hayatın küçük zevklerindendir.',
      'Fast food yemek günah değil, zaman yönetimidir.',
    ],
  },
  {
    keywords: ['gece', '2\'de', '3\'te', 'sabah', 'geç'],
    replies: [
      'Gece 3\'te yapılan yemeklerin vicdanı olmaz, sadece lezzeti olur.',
      'Gece yemekleri, gündüz yemeklerinden daha samimi ve dürüsttür.',
      'Gece açlığı, gündüz açlığından 3 kat daha güçlüdür. Bilimsel gerçek.',
      'Gece 2\'de buzdolabı açmak, cesaret işidir. Tebrikler.',
      'Gece yemekleri kalori saymaz, bu evrensel bir kuraldır.',
    ],
  },
  {
    keywords: ['çikolata', 'nutella', 'snickers', 'çiklet'],
    replies: [
      'Çikolata, dünyayı daha güzel bir yer yapar. Sen iyilik yaptın.',
      'Çikolata yemek, kendine iyi davranmaktır.',
      'Çikolata, stres çözücüdür. Doktor reçetesi gibi.',
      'Nutella, ekmek için değil, kaşık içindir. Herkes bunu bilir.',
      'Çikolata, mutluluk garantisidir. Para iadesi yok.',
    ],
  },
  {
    keywords: ['lahmacun', 'döner', 'kebap', 'pide', 'börek'],
    replies: [
      'Türk mutfağı, dünya mirası. Sen kültürünü yaşatıyorsun.',
      'Lahmacun, ruhun gıdasıdır. Bedene de iyi gelir.',
      'Döner yemek, vatanseverlik göstergesidir.',
      'Pide, ailenin bir araya gelmesidir. Sosyal bir eylem.',
      'Börek, sabah kahvaltısının kraliçesidir. Saygı duy.',
    ],
  },
  {
    keywords: ['dondurma', 'milkshake', 'smoothie'],
    replies: [
      'Dondurma, yetişkinlerin çocukluk anılarıdır. Nostalji yemek sağlıklıdır.',
      'Dondurma yemek, yazın tadını çıkarmaktır.',
      'Milkshake, sıvı mutluluktur. İçmek zorundasın.',
      'Dondurma, stres çözücüdür. Soğuk terapi gibi.',
      'Dondurma yemek, hayata "evet" demektir.',
    ],
  },
  {
    keywords: ['cips', 'krakker', 'atıştırmalık', 'kuruyemiş'],
    replies: [
      'Cips, televizyon arkadaşıdır. Yalnız bırakamazsın.',
      'Atıştırmalık, hayatın küçük zevkleridir.',
      'Cips paketi açıldı mı, bitmesi gerekir. Fizik kuralı.',
      'Kuruyemiş, beyin gıdasıdır. Akıllı bir seçim.',
      'Atıştırmalık yemek, sosyal bir aktivitedir.',
    ],
  },
  {
    keywords: ['kola', 'gazoz', 'içecek', 'soda'],
    replies: [
      'Gazlı içecekler, hayatın gazını alır. Paradoks ama doğru.',
      'Kola, evrensel bir dil. Herkes anlar.',
      'Gazoz, çocukluğun tadıdır. Nostalji içmek sağlıklıdır.',
      'Soğuk içecek, sıcak günlerin kurtarıcısıdır.',
      'Gazlı içecek, mutluluk baloncuklarıdır.',
    ],
  },
];

const defaultReplies = [
  'Bazen kendimize iyi davranmak gerekir. Bu da onlardan biri.',
  'Hayat kısa, yemek uzun. Doğru tercih.',
  'Suçluluk hissetme, tadını çıkar. Yarın yeni bir gün.',
  'Bu bir günah değil, bir deneyim. Yaşamak için yiyoruz.',
  'Kendine karşı dürüst oldun. Bu cesaret ister.',
  'Yemek, hayatın en güzel yanlarından. Sen yaşıyorsun.',
  'Bu bir hata değil, bir seçim. Ve sen seçtin.',
  'Bazen "hayır" demek yerine "evet" demek gerekir.',
  'Hayat dengedir. Bugün biraz dengesizlik oldu, olsun.',
  'Sen yemedin, yemek seni yedi. Fark var.',
];

export async function generateAIReply(text: string): Promise<string> {
  const lowerText = text.toLowerCase();
  
  // Pattern matching
  for (const pattern of foodPatterns) {
    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword)) {
        const randomIndex = Math.floor(Math.random() * pattern.replies.length);
        return pattern.replies[randomIndex];
      }
    }
  }
  
  // Default reply
  const randomIndex = Math.floor(Math.random() * defaultReplies.length);
  return defaultReplies[randomIndex];
}
