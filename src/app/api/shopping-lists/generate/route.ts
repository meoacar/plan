import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Beslenme planından alışveriş listesi oluştur
function generateShoppingItems(dietContent: string) {
  const items: any[] = []
  const text = dietContent.toLowerCase()

  // Protein kaynakları
  const proteins = [
    { name: "Tavuk göğsü", keywords: ["tavuk", "chicken", "piliç"], quantity: "500g" },
    { name: "Yumurta", keywords: ["yumurta", "egg"], quantity: "10 adet" },
    { name: "Ton balığı", keywords: ["ton", "tuna"], quantity: "2 kutu" },
    { name: "Hindi göğsü", keywords: ["hindi", "turkey"], quantity: "500g" },
    { name: "Somon", keywords: ["somon", "salmon"], quantity: "300g" },
    { name: "Levrek", keywords: ["levrek", "sea bass"], quantity: "300g" },
    { name: "Çipura", keywords: ["çipura", "sea bream"], quantity: "300g" },
    { name: "Kırmızı et (dana)", keywords: ["et", "beef", "dana", "kırmızı et"], quantity: "500g" },
    { name: "Köfte (yağsız)", keywords: ["köfte"], quantity: "400g" },
    { name: "Izgara tavuk", keywords: ["ızgara tavuk"], quantity: "400g" },
    { name: "Protein tozu", keywords: ["protein tozu", "whey", "protein powder"], quantity: "1 kutu" },
    { name: "Sardalya", keywords: ["sardalya", "sardine"], quantity: "2 kutu" },
    { name: "Uskumru", keywords: ["uskumru", "mackerel"], quantity: "300g" },
    { name: "Karides", keywords: ["karides", "shrimp"], quantity: "250g" },
    { name: "Midye", keywords: ["midye", "mussel"], quantity: "200g" },
    { name: "Ahtapot", keywords: ["ahtapot", "octopus"], quantity: "200g" },
    { name: "Kalamar", keywords: ["kalamar", "squid"], quantity: "200g" },
    { name: "Hamsi", keywords: ["hamsi", "anchovy"], quantity: "300g" },
    { name: "Palamut", keywords: ["palamut", "bonito"], quantity: "300g" },
    { name: "Alabalık", keywords: ["alabalık", "trout"], quantity: "300g" }
  ]

  // Sebzeler
  const vegetables = [
    { name: "Brokoli", keywords: ["brokoli", "broccoli"], quantity: "300g" },
    { name: "Karnabahar", keywords: ["karnabahar", "cauliflower"], quantity: "1 adet" },
    { name: "Salatalık", keywords: ["salatalık", "cucumber"], quantity: "3 adet" },
    { name: "Domates", keywords: ["domates", "tomato"], quantity: "500g" },
    { name: "Cherry domates", keywords: ["cherry", "kiraz domates"], quantity: "250g" },
    { name: "Marul", keywords: ["marul", "lettuce"], quantity: "1 adet" },
    { name: "Roka", keywords: ["roka", "arugula", "rocket"], quantity: "1 demet" },
    { name: "Havuç", keywords: ["havuç", "carrot"], quantity: "500g" },
    { name: "Ispanak", keywords: ["ıspanak", "spinach"], quantity: "300g" },
    { name: "Kabak", keywords: ["kabak", "zucchini"], quantity: "2 adet" },
    { name: "Patlıcan", keywords: ["patlıcan", "eggplant"], quantity: "2 adet" },
    { name: "Biber", keywords: ["biber", "pepper"], quantity: "3 adet" },
    { name: "Yeşil biber", keywords: ["yeşil biber"], quantity: "5 adet" },
    { name: "Kırmızı lahana", keywords: ["kırmızı lahana", "red cabbage"], quantity: "1 adet" },
    { name: "Beyaz lahana", keywords: ["lahana", "cabbage"], quantity: "1 adet" },
    { name: "Kereviz", keywords: ["kereviz", "celery"], quantity: "1 adet" },
    { name: "Pırasa", keywords: ["pırasa", "leek"], quantity: "2 adet" },
    { name: "Mantar", keywords: ["mantar", "mushroom"], quantity: "250g" },
    { name: "Taze fasulye", keywords: ["fasulye", "green beans"], quantity: "300g" },
    { name: "Bezelye", keywords: ["bezelye", "peas"], quantity: "250g" },
    { name: "Pancar", keywords: ["pancar", "beet"], quantity: "2 adet" },
    { name: "Turp", keywords: ["turp", "radish"], quantity: "1 demet" },
    { name: "Maydanoz", keywords: ["maydanoz", "parsley"], quantity: "1 demet" },
    { name: "Dereotu", keywords: ["dereotu", "dill"], quantity: "1 demet" },
    { name: "Nane", keywords: ["nane", "mint"], quantity: "1 demet" },
    { name: "Taze soğan", keywords: ["taze soğan", "spring onion"], quantity: "1 demet" },
    { name: "Sarımsak", keywords: ["sarımsak", "garlic"], quantity: "1 baş" },
    { name: "Soğan", keywords: ["soğan", "onion"], quantity: "1kg" }
  ]

  // Meyveler
  const fruits = [
    { name: "Elma", keywords: ["elma", "apple"], quantity: "5 adet" },
    { name: "Yeşil elma", keywords: ["yeşil elma", "green apple"], quantity: "5 adet" },
    { name: "Muz", keywords: ["muz", "banana"], quantity: "1 demet" },
    { name: "Portakal", keywords: ["portakal", "orange"], quantity: "5 adet" },
    { name: "Mandalina", keywords: ["mandalina", "mandarin"], quantity: "1kg" },
    { name: "Greyfurt", keywords: ["greyfurt", "grapefruit"], quantity: "3 adet" },
    { name: "Limon", keywords: ["limon", "lemon"], quantity: "5 adet" },
    { name: "Çilek", keywords: ["çilek", "strawberry"], quantity: "250g" },
    { name: "Ahududu", keywords: ["ahududu", "raspberry"], quantity: "150g" },
    { name: "Yaban mersini", keywords: ["yaban mersini", "blueberry"], quantity: "150g" },
    { name: "Böğürtlen", keywords: ["böğürtlen", "blackberry"], quantity: "150g" },
    { name: "Kivi", keywords: ["kivi"], quantity: "4 adet" },
    { name: "Üzüm", keywords: ["üzüm", "grape"], quantity: "300g" },
    { name: "Armut", keywords: ["armut", "pear"], quantity: "4 adet" },
    { name: "Şeftali", keywords: ["şeftali", "peach"], quantity: "4 adet" },
    { name: "Kayısı", keywords: ["kayısı", "apricot"], quantity: "300g" },
    { name: "Kiraz", keywords: ["kiraz", "cherry"], quantity: "250g" },
    { name: "Karpuz", keywords: ["karpuz", "watermelon"], quantity: "1 adet" },
    { name: "Kavun", keywords: ["kavun", "melon"], quantity: "1 adet" },
    { name: "Ananas", keywords: ["ananas", "pineapple"], quantity: "1 adet" },
    { name: "Avokado", keywords: ["avokado", "avocado"], quantity: "2 adet" },
    { name: "Nar", keywords: ["nar", "pomegranate"], quantity: "2 adet" }
  ]

  // Tahıllar
  const grains = [
    { name: "Yulaf", keywords: ["yulaf", "oat"], quantity: "500g" },
    { name: "Yulaf ezmesi", keywords: ["yulaf ezmesi", "oatmeal"], quantity: "500g" },
    { name: "Esmer pirinç", keywords: ["pirinç", "rice", "esmer pirinç"], quantity: "1kg" },
    { name: "Tam buğday ekmeği", keywords: ["ekmek", "bread", "tam buğday"], quantity: "1 adet" },
    { name: "Çavdar ekmeği", keywords: ["çavdar", "rye bread"], quantity: "1 adet" },
    { name: "Kepekli ekmek", keywords: ["kepekli", "bran bread"], quantity: "1 adet" },
    { name: "Kinoa", keywords: ["kinoa", "quinoa"], quantity: "300g" },
    { name: "Bulgur", keywords: ["bulgur"], quantity: "500g" },
    { name: "Kuskus", keywords: ["kuskus", "couscous"], quantity: "300g" },
    { name: "Tam buğday makarna", keywords: ["makarna", "pasta", "tam buğday makarna"], quantity: "500g" },
    { name: "Kepekli galeta", keywords: ["galeta", "cracker"], quantity: "1 paket" },
    { name: "Tam tahıllı gevrek", keywords: ["gevrek", "cereal", "mısır gevreği"], quantity: "1 kutu" },
    { name: "Chia tohumu", keywords: ["chia"], quantity: "200g" },
    { name: "Keten tohumu", keywords: ["keten", "flaxseed"], quantity: "200g" },
    { name: "Kepek", keywords: ["kepek", "bran"], quantity: "300g" }
  ]

  // Süt Ürünleri
  const dairyProducts = [
    { name: "Süt (yağsız)", keywords: ["süt", "milk"], quantity: "1 litre" },
    { name: "Yoğurt", keywords: ["yoğurt", "yogurt"], quantity: "500g" },
    { name: "Süzme yoğurt", keywords: ["süzme yoğurt", "greek yogurt"], quantity: "500g" },
    { name: "Kefir", keywords: ["kefir"], quantity: "500ml" },
    { name: "Ayran", keywords: ["ayran"], quantity: "1 litre" },
    { name: "Beyaz peynir (light)", keywords: ["beyaz peynir", "feta"], quantity: "200g" },
    { name: "Lor peyniri", keywords: ["lor"], quantity: "200g" },
    { name: "Cottage cheese", keywords: ["cottage"], quantity: "200g" },
    { name: "Labne", keywords: ["labne"], quantity: "200g" },
    { name: "Kaşar peyniri (light)", keywords: ["kaşar"], quantity: "150g" },
    { name: "Tulum peyniri", keywords: ["tulum"], quantity: "150g" }
  ]

  // İçecekler
  const beverages = [
    { name: "Su", keywords: ["su", "water"], quantity: "6 litre" },
    { name: "Maden suyu", keywords: ["maden suyu", "soda"], quantity: "6 adet" },
    { name: "Yeşil çay", keywords: ["yeşil çay", "green tea"], quantity: "1 kutu" },
    { name: "Bitki çayı", keywords: ["bitki çayı", "herbal tea"], quantity: "1 kutu" },
    { name: "Siyah çay", keywords: ["çay", "tea", "siyah çay"], quantity: "1 kutu" },
    { name: "Badem sütü", keywords: ["badem sütü", "almond milk"], quantity: "1 litre" },
    { name: "Yulaf sütü", keywords: ["yulaf sütü", "oat milk"], quantity: "1 litre" },
    { name: "Hindistan cevizi suyu", keywords: ["hindistan cevizi", "coconut water"], quantity: "1 litre" },
    { name: "Taze sıkılmış meyve suyu", keywords: ["meyve suyu", "juice"], quantity: "1 litre" },
    { name: "Detox suyu", keywords: ["detox"], quantity: "1 litre" },
    { name: "Kahve (filtre)", keywords: ["kahve", "coffee"], quantity: "250g" }
  ]

  // Diğer (Yağlar, Kuruyemişler, Baharatlar, Diyet Ürünleri)
  const others = [
    // Yağlar
    { name: "Zeytinyağı", keywords: ["zeytinyağı", "olive oil"], quantity: "250ml" },
    { name: "Hindistan cevizi yağı", keywords: ["hindistan cevizi yağı", "coconut oil"], quantity: "200ml" },
    { name: "Avokado yağı", keywords: ["avokado yağı"], quantity: "200ml" },
    
    // Kuruyemişler
    { name: "Badem", keywords: ["badem", "almond"], quantity: "200g" },
    { name: "Ceviz", keywords: ["ceviz", "walnut"], quantity: "200g" },
    { name: "Fındık", keywords: ["fındık", "hazelnut"], quantity: "200g" },
    { name: "Antep fıstığı", keywords: ["antep fıstığı", "pistachio"], quantity: "150g" },
    { name: "Kaju", keywords: ["kaju", "cashew"], quantity: "150g" },
    { name: "Çiğ fıstık", keywords: ["çiğ fıstık", "peanut"], quantity: "200g" },
    { name: "Fıstık ezmesi", keywords: ["fıstık ezmesi", "peanut butter"], quantity: "1 kavanoz" },
    { name: "Badem ezmesi", keywords: ["badem ezmesi", "almond butter"], quantity: "1 kavanoz" },
    { name: "Tahin", keywords: ["tahin", "tahini"], quantity: "300g" },
    { name: "Pekmez", keywords: ["pekmez", "molasses"], quantity: "300g" },
    
    // Kuruyemişler ve Tohumlar
    { name: "Susam", keywords: ["susam", "sesame"], quantity: "100g" },
    { name: "Kabak çekirdeği", keywords: ["kabak çekirdeği", "pumpkin seeds"], quantity: "150g" },
    { name: "Ayçekirdeği", keywords: ["ayçekirdeği", "sunflower seeds"], quantity: "150g" },
    { name: "Kuru üzüm", keywords: ["kuru üzüm", "raisin"], quantity: "200g" },
    { name: "Kuru kayısı", keywords: ["kuru kayısı", "dried apricot"], quantity: "200g" },
    { name: "Kuru incir", keywords: ["kuru incir", "dried fig"], quantity: "200g" },
    { name: "Hurma", keywords: ["hurma", "date"], quantity: "200g" },
    
    // Baharatlar ve Tatlandırıcılar
    { name: "Tarçın", keywords: ["tarçın", "cinnamon"], quantity: "50g" },
    { name: "Zencefil", keywords: ["zencefil", "ginger"], quantity: "100g" },
    { name: "Zerdeçal", keywords: ["zerdeçal", "turmeric"], quantity: "50g" },
    { name: "Karabiber", keywords: ["karabiber", "black pepper"], quantity: "50g" },
    { name: "Kırmızı pul biber", keywords: ["pul biber", "red pepper flakes"], quantity: "50g" },
    { name: "Kimyon", keywords: ["kimyon", "cumin"], quantity: "50g" },
    { name: "Kekik", keywords: ["kekik", "thyme"], quantity: "30g" },
    { name: "Fesleğen", keywords: ["fesleğen", "basil"], quantity: "30g" },
    { name: "Stevia", keywords: ["stevia"], quantity: "1 paket" },
    { name: "Bal", keywords: ["bal", "honey"], quantity: "250g" },
    { name: "Elma sirkesi", keywords: ["elma sirkesi", "apple cider vinegar"], quantity: "500ml" },
    { name: "Limon suyu", keywords: ["limon suyu", "lemon juice"], quantity: "250ml" },
    
    // Diyet Ürünleri
    { name: "Diyet kraker", keywords: ["diyet kraker"], quantity: "1 paket" },
    { name: "Pirinç patlağı", keywords: ["pirinç patlağı", "rice cake"], quantity: "1 paket" },
    { name: "Mısır patlağı", keywords: ["mısır patlağı", "popcorn"], quantity: "200g" },
    { name: "Bitter çikolata (%70+)", keywords: ["bitter", "dark chocolate"], quantity: "100g" },
    { name: "Diyet jöle", keywords: ["jöle", "jelly"], quantity: "1 paket" },
    { name: "Probiyotik", keywords: ["probiyotik", "probiotic"], quantity: "1 kutu" },
    { name: "Omega-3", keywords: ["omega", "balık yağı"], quantity: "1 kutu" },
    { name: "Multivitamin", keywords: ["vitamin", "multivitamin"], quantity: "1 kutu" },
    { name: "Kollajen", keywords: ["kollajen", "collagen"], quantity: "1 kutu" },
    
    // Konserveler ve Hazır Ürünler
    { name: "Zeytinler", keywords: ["zeytin", "olive"], quantity: "200g" },
    { name: "Turşu", keywords: ["turşu", "pickle"], quantity: "1 kavanoz" },
    { name: "Humus", keywords: ["humus", "hummus"], quantity: "200g" },
    { name: "Salsa sos", keywords: ["salsa"], quantity: "1 kavanoz" },
    { name: "Domates sosu (şekersiz)", keywords: ["domates sosu", "tomato sauce"], quantity: "1 kavanoz" }
  ]

  let order = 0

  // Her kategoriden eşleşenleri ekle
  proteins.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "Protein",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  vegetables.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "Sebze",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  fruits.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "Meyve",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  grains.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "Tahıl",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  dairyProducts.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "Süt Ürünleri",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  beverages.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "İçecek",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  others.forEach(item => {
    if (item.keywords.some(kw => text.includes(kw))) {
      items.push({
        category: "Diğer",
        name: item.name,
        quantity: item.quantity,
        order: order++
      })
    }
  })

  // Eğer hiç öğe bulunamadıysa, temel öğeleri ekle
  if (items.length === 0) {
    items.push(
      { category: "Protein", name: "Tavuk göğsü", quantity: "500g", order: 0 },
      { category: "Sebze", name: "Brokoli", quantity: "300g", order: 1 },
      { category: "Meyve", name: "Elma", quantity: "5 adet", order: 2 },
      { category: "Tahıl", name: "Yulaf", quantity: "500g", order: 3 },
      { category: "İçecek", name: "Su", quantity: "6 litre", order: 4 }
    )
  }

  return items
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { planId, planTitle, dietContent } = body

    if (!dietContent) {
      return NextResponse.json({ error: "Beslenme planı gerekli" }, { status: 400 })
    }

    // Akıllı liste oluştur
    const items = generateShoppingItems(dietContent)

    const listName = planTitle 
      ? `${planTitle} - Alışveriş Listesi`
      : "Haftalık Alışveriş Listesi"

    const list = await prisma.shoppingList.create({
      data: {
        userId: session.user.id,
        planId,
        name: listName,
        description: "Diyet planınıza göre otomatik oluşturuldu",
        items: {
          create: items
        }
      },
      include: {
        items: {
          orderBy: [{ category: "asc" }, { order: "asc" }]
        }
      }
    })

    return NextResponse.json({ list })
  } catch (error) {
    console.error("Shopping list generate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
