import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Create regular users
  const user1Password = await bcrypt.hash('user123', 10)
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      passwordHash: user1Password,
      name: 'Ayşe Yılmaz',
      startWeight: 85,
      goalWeight: 65,
      bio: 'Sağlıklı yaşam yolculuğumda 3. yılım',
    },
  })

  const user2Password = await bcrypt.hash('user123', 10)
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      passwordHash: user2Password,
      name: 'Mehmet Demir',
      startWeight: 95,
      goalWeight: 75,
    },
  })

  // Create sample plans
  const plan1 = await prisma.plan.upsert({
    where: { slug: '3-ayda-15-kilo-verdim-gercek-hikayem-abc123' },
    update: {},
    create: {
      userId: user1.id,
      title: '3 Ayda 15 Kilo Verdim - Gerçek Hikayem',
      slug: '3-ayda-15-kilo-verdim-gercek-hikayem-abc123',
      startWeight: 85,
      goalWeight: 70,
      durationText: '90 gün',
      routine: 'Her sabah 06:00\'da kalkıyordum. İlk iş bir bardak ılık su içiyordum. Kahvaltıdan önce 30 dakika yürüyüş yapıyordum. Gün içinde 3 öğün yemek yiyordum ve ara öğünlerde meyve tüketiyordum.',
      diet: 'Kahvaltı: Yumurta, peynir, domates, salatalık, tam buğday ekmeği\nÖğle: Izgara tavuk veya balık, bol salata\nAkşam: Sebze yemeği, yoğurt\nAra öğün: Meyve, çiğ badem',
      exercise: 'Haftada 5 gün sabah yürüyüşü (30 dk)\nHaftada 3 gün evde egzersiz (squat, plank, şınav)\nHaftanın 1 günü dinlenme',
      motivation: 'Kendinize inanın, her gün bir adım daha yaklaşıyorsunuz!',
      status: 'APPROVED',
      views: 245,
    },
  })

  const plan2 = await prisma.plan.upsert({
    where: { slug: 'spor-salonuyla-20-kilo-verdim-def456' },
    update: {},
    create: {
      userId: user2.id,
      title: 'Spor Salonuyla 20 Kilo Verdim',
      slug: 'spor-salonuyla-20-kilo-verdim-def456',
      startWeight: 95,
      goalWeight: 75,
      durationText: '6 ay',
      routine: 'Sabah 07:00 kalkış, kahvaltı sonrası spor salonu. Öğleden sonra işe gidiyordum. Akşam hafif yemek ve erken uyku.',
      diet: 'Yüksek protein, düşük karbonhidrat diyeti uyguladım. Günde 2000 kalori hedefledim. Bol su içtim.',
      exercise: 'Haftada 5 gün spor salonu\n3 gün ağırlık çalışması\n2 gün kardiyo\nHer seans 60-90 dakika',
      motivation: 'Vazgeçmek yok, hedefine odaklan!',
      status: 'APPROVED',
      views: 189,
    },
  })

  const plan3 = await prisma.plan.upsert({
    where: { slug: 'evde-egzersizle-10-kilo-ghi789' },
    update: {},
    create: {
      userId: user1.id,
      title: 'Evde Egzersizle 10 Kilo',
      slug: 'evde-egzersizle-10-kilo-ghi789',
      startWeight: 75,
      goalWeight: 65,
      durationText: '4 ay',
      routine: 'Düzenli uyku, düzenli öğünler, stres yönetimi. Her gün aynı saatte kalkıp yatmaya özen gösterdim.',
      diet: 'Akdeniz diyeti prensiplerine uydum. Zeytinyağı, balık, sebze ağırlıklı beslenme. Şeker ve işlenmiş gıdalardan uzak durdum.',
      exercise: 'YouTube\'dan takip ettiğim 30 dakikalık egzersiz videoları. Haftada 4-5 gün düzenli olarak yaptım. Yoga ve pilates ağırlıklı.',
      motivation: 'Sağlıklı olmak bir yaşam tarzıdır!',
      status: 'APPROVED',
      views: 156,
    },
  })

  // Create likes (skip if already exists)
  await prisma.like.upsert({
    where: {
      planId_userId: {
        planId: plan1.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      planId: plan1.id,
    },
  })

  await prisma.like.upsert({
    where: {
      planId_userId: {
        planId: plan2.id,
        userId: user1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      planId: plan2.id,
    },
  })

  // Create comments (check if exists first)
  const existingComments = await prisma.comment.findMany({
    where: {
      OR: [
        { userId: user2.id, planId: plan1.id },
        { userId: user1.id, planId: plan2.id },
        { userId: admin.id, planId: plan1.id },
      ],
    },
  })

  if (existingComments.length === 0) {
    await prisma.comment.create({
      data: {
        userId: user2.id,
        planId: plan1.id,
        body: 'Harika bir plan! Ben de benzer bir yol izliyorum, çok motive oldum.',
      },
    })

    await prisma.comment.create({
      data: {
        userId: user1.id,
        planId: plan2.id,
        body: 'Tebrikler! Spor salonuna gitmek için motivasyon arıyordum, bu yazı çok yardımcı oldu.',
      },
    })

    await prisma.comment.create({
      data: {
        userId: admin.id,
        planId: plan1.id,
        body: 'Çok güzel bir paylaşım, teşekkürler!',
      },
    })
  }

  // Create categories
  const categoryVegan = await prisma.category.upsert({
    where: { slug: 'vegan' },
    update: {},
    create: {
      name: 'Vegan',
      slug: 'vegan',
      description: 'Hayvansal ürün içermeyen beslenme planları',
      color: '#4caf50',
      order: 1,
    },
  })

  const categoryKeto = await prisma.category.upsert({
    where: { slug: 'keto' },
    update: {},
    create: {
      name: 'Keto',
      slug: 'keto',
      description: 'Düşük karbonhidrat, yüksek yağ diyeti planları',
      color: '#ff9800',
      order: 2,
    },
  })

  const categorySport = await prisma.category.upsert({
    where: { slug: 'spor' },
    update: {},
    create: {
      name: 'Spor',
      slug: 'spor',
      description: 'Spor ve egzersiz odaklı planlar',
      color: '#2196f3',
      order: 3,
    },
  })

  const categoryHome = await prisma.category.upsert({
    where: { slug: 'evde-egzersiz' },
    update: {},
    create: {
      name: 'Evde Egzersiz',
      slug: 'evde-egzersiz',
      description: 'Evde yapılabilecek egzersiz planları',
      color: '#9c27b0',
      order: 4,
    },
  })

  const categoryMediterranean = await prisma.category.upsert({
    where: { slug: 'akdeniz-diyeti' },
    update: {},
    create: {
      name: 'Akdeniz Diyeti',
      slug: 'akdeniz-diyeti',
      description: 'Akdeniz mutfağı esaslı beslenme planları',
      color: '#00bcd4',
      order: 5,
    },
  })

  // Create tags
  const tagFastWeight = await prisma.tag.upsert({
    where: { slug: 'hizli-kilo' },
    update: {},
    create: {
      name: 'Hızlı Kilo',
      slug: 'hizli-kilo',
    },
  })

  const tagHealthy = await prisma.tag.upsert({
    where: { slug: 'saglikli' },
    update: {},
    create: {
      name: 'Sağlıklı',
      slug: 'saglikli',
    },
  })

  const tagBeginner = await prisma.tag.upsert({
    where: { slug: 'baslangic' },
    update: {},
    create: {
      name: 'Başlangıç',
      slug: 'baslangic',
    },
  })

  const tagAdvanced = await prisma.tag.upsert({
    where: { slug: 'ileri-seviye' },
    update: {},
    create: {
      name: 'İleri Seviye',
      slug: 'ileri-seviye',
    },
  })

  const tagBudget = await prisma.tag.upsert({
    where: { slug: 'ekonomik' },
    update: {},
    create: {
      name: 'Ekonomik',
      slug: 'ekonomik',
    },
  })

  // Update existing plans with categories and tags
  await prisma.plan.update({
    where: { id: plan1.id },
    data: {
      categoryId: categoryHome.id,
    },
  })

  await prisma.planTag.upsert({
    where: {
      planId_tagId: {
        planId: plan1.id,
        tagId: tagHealthy.id,
      },
    },
    update: {},
    create: {
      planId: plan1.id,
      tagId: tagHealthy.id,
    },
  })

  await prisma.planTag.upsert({
    where: {
      planId_tagId: {
        planId: plan1.id,
        tagId: tagBeginner.id,
      },
    },
    update: {},
    create: {
      planId: plan1.id,
      tagId: tagBeginner.id,
    },
  })

  await prisma.plan.update({
    where: { id: plan2.id },
    data: {
      categoryId: categorySport.id,
    },
  })

  await prisma.planTag.upsert({
    where: {
      planId_tagId: {
        planId: plan2.id,
        tagId: tagAdvanced.id,
      },
    },
    update: {},
    create: {
      planId: plan2.id,
      tagId: tagAdvanced.id,
    },
  })

  await prisma.plan.update({
    where: { id: plan3.id },
    data: {
      categoryId: categoryHome.id,
    },
  })

  await prisma.planTag.upsert({
    where: {
      planId_tagId: {
        planId: plan3.id,
        tagId: tagHealthy.id,
      },
    },
    update: {},
    create: {
      planId: plan3.id,
      tagId: tagHealthy.id,
    },
  })

  await prisma.planTag.upsert({
    where: {
      planId_tagId: {
        planId: plan3.id,
        tagId: tagBudget.id,
      },
    },
    update: {},
    create: {
      planId: plan3.id,
      tagId: tagBudget.id,
    },
  })

  // Create site settings (only if not exists)
  const existingSettings = await prisma.siteSettings.findFirst()
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteTitle: 'Zayıflama Planım',
        siteDescription: 'Gerçek insanların gerçek zayıflama hikayeleri ve planları. Sağlıklı yaşam için ilham alın, kendi planınızı paylaşın.',
        logoUrl: '/logo.png',
        twitterUrl: 'https://twitter.com/zayiflamaplanim',
        instagramUrl: 'https://instagram.com/zayiflamaplanim',
        facebookUrl: 'https://facebook.com/zayiflamaplanim',
        footerText: '© 2024 Zayıflama Planım. Tüm hakları saklıdır. Sağlıklı yaşam için buradayız.',
        maintenanceMode: false,
        updatedBy: admin.id,
      },
    })
  }

  console.log('Seeding completed!')
  console.log('Admin: admin@example.com / admin123')
  console.log('User1: user1@example.com / user123')
  console.log('User2: user2@example.com / user123')
  console.log('Categories created: 5')
  console.log('Tags created: 5')
  console.log('Site settings initialized')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
