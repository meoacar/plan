import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Anket seed başlıyor...");

  // Admin kullanıcısını bul
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("❌ Admin kullanıcısı bulunamadı!");
    return;
  }

  // Örnek anketler
  const polls = [
    {
      question: "Hangi diyet yöntemini tercih ediyorsunuz?",
      description: "En etkili bulduğunuz diyet yöntemini seçin",
      allowMultiple: false,
      options: [
        "Ketojenik Diyet",
        "Aralıklı Oruç",
        "Akdeniz Diyeti",
        "Düşük Karbonhidrat",
        "Kalori Sayma",
      ],
    },
    {
      question: "Haftada kaç gün spor yapıyorsunuz?",
      description: "Düzenli egzersiz alışkanlığınızı paylaşın",
      allowMultiple: false,
      options: [
        "Hiç",
        "1-2 gün",
        "3-4 gün",
        "5-6 gün",
        "Her gün",
      ],
    },
    {
      question: "Hangi egzersiz türlerini yapıyorsunuz?",
      description: "Birden fazla seçenek işaretleyebilirsiniz",
      allowMultiple: true,
      options: [
        "Yürüyüş",
        "Koşu",
        "Fitness/Ağırlık",
        "Yoga/Pilates",
        "Yüzme",
        "Bisiklet",
      ],
    },
    {
      question: "Motivasyonunuzu nasıl sağlıyorsunuz?",
      description: "Size en çok yardımcı olan yöntemleri seçin",
      allowMultiple: true,
      options: [
        "İlerleme fotoğrafları",
        "Kilo takibi",
        "Sosyal medya paylaşımları",
        "Arkadaş desteği",
        "Hedef belirleme",
        "Ödül sistemi",
      ],
    },
  ];

  for (const pollData of polls) {
    const { options, ...pollInfo } = pollData;
    
    const poll = await prisma.poll.create({
      data: {
        ...pollInfo,
        createdBy: admin.id,
        isActive: true,
        options: {
          create: options.map((text, index) => ({
            text,
            order: index,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    console.log(`✅ Anket oluşturuldu: ${poll.question}`);
  }

  console.log("🎉 Anket seed tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
