import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Beslenme planından alışveriş listesi oluştur
function generateShoppingItems(dietContent: string) {
  const items: any[] = []
  const text = dietContent.toLowerCase()

  // Protein kaynakları
  const proteins = [
    { name: "Tavuk göğsü", keywords: ["tavuk", "chicken"], quantity: "500g" },
    { name: "Yumurta", keywords: ["yumurta", "egg"], quantity: "10 adet" },
    { name: "Ton balığı", keywords: ["ton", "tuna"], quantity: "2 kutu" },
    { name: "Süzme yoğurt", keywords: ["yoğurt", "yogurt"], quantity: "500g" },
    { name: "Peynir", keywords: ["peynir", "cheese"], quantity: "200g" },
    { name: "Hindi", keywords: ["hindi", "turkey"], quantity: "500g" },
    { name: "Somon", keywords: ["somon", "salmon"], quantity: "300g" },
    { name: "Kırmızı et", keywords: ["et", "beef", "dana"], quantity: "500g" }
  ]

  // Sebzeler
  const vegetables = [
    { name: "Brokoli", keywords: ["brokoli", "broccoli"], quantity: "300g" },
    { name: "Salatalık", keywords: ["salatalık", "cucumber"], quantity: "3 adet" },
    { name: "Domates", keywords: ["domates", "tomato"], quantity: "500g" },
    { name: "Marul", keywords: ["marul", "lettuce"], quantity: "1 adet" },
    { name: "Havuç", keywords: ["havuç", "carrot"], quantity: "500g" },
    { name: "Ispanak", keywords: ["ıspanak", "spinach"], quantity: "300g" },
    { name: "Kabak", keywords: ["kabak", "zucchini"], quantity: "2 adet" },
    { name: "Biber", keywords: ["biber", "pepper"], quantity: "3 adet" }
  ]

  // Meyveler
  const fruits = [
    { name: "Elma", keywords: ["elma", "apple"], quantity: "5 adet" },
    { name: "Muz", keywords: ["muz", "banana"], quantity: "1 demet" },
    { name: "Portakal", keywords: ["portakal", "orange"], quantity: "5 adet" },
    { name: "Çilek", keywords: ["çilek", "strawberry"], quantity: "250g" },
    { name: "Kivi", keywords: ["kivi"], quantity: "4 adet" },
    { name: "Üzüm", keywords: ["üzüm", "grape"], quantity: "300g" }
  ]

  // Tahıllar
  const grains = [
    { name: "Yulaf", keywords: ["yulaf", "oat"], quantity: "500g" },
    { name: "Esmer pirinç", keywords: ["pirinç", "rice"], quantity: "1kg" },
    { name: "Tam buğday ekmeği", keywords: ["ekmek", "bread"], quantity: "1 adet" },
    { name: "Kinoa", keywords: ["kinoa", "quinoa"], quantity: "300g" },
    { name: "Bulgur", keywords: ["bulgur"], quantity: "500g" }
  ]

  // İçecekler
  const beverages = [
    { name: "Su", keywords: ["su", "water"], quantity: "6 litre" },
    { name: "Yeşil çay", keywords: ["çay", "tea"], quantity: "1 kutu" },
    { name: "Süt", keywords: ["süt", "milk"], quantity: "1 litre" }
  ]

  // Diğer
  const others = [
    { name: "Zeytinyağı", keywords: ["zeytinyağı", "olive oil"], quantity: "250ml" },
    { name: "Badem", keywords: ["badem", "almond"], quantity: "200g" },
    { name: "Ceviz", keywords: ["ceviz", "walnut"], quantity: "200g" },
    { name: "Fıstık ezmesi", keywords: ["fıstık ezmesi", "peanut butter"], quantity: "1 kavanoz" }
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
