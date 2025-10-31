import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🎬 Tanıtım verileri ekleniyor...");

    // Özellikler
    const features = [
        {
            icon: "target",
            title: "Gerçek Planlar",
            description: "Kendine ait bir plan oluştur. Takipçilerin seni alkışlasın.",
            color: "#10b981",
            link: "/",
            order: 1,
        },
        {
            icon: "message",
            title: "Günah Duvarı",
            description: "'Yeme Günahı Duvarı'nda itiraf et, gülüşleri topla.",
            color: "#f59e0b",
            link: "/gunah-itiraf",
            order: 2,
        },
        {
            icon: "utensils",
            title: "Tarif Alanı",
            description: "İstersen tarif ekle, istersen hikâyeni anlat.",
            color: "#ef4444",
            link: "/recipes",
            order: 3,
        },
        {
            icon: "zap",
            title: "XP Sistemi",
            description: "Her adımında XP kazan, seviye atla!",
            color: "#8b5cf6",
            link: "/gamification",
            order: 4,
        },
    ];

    for (const feature of features) {
        await prisma.promoFeature.upsert({
            where: { id: `feature-${feature.order}` },
            update: feature,
            create: {
                id: `feature-${feature.order}`,
                ...feature,
            },
        });
    }

    console.log("✅ Özellikler eklendi");

    // Mikro Kopyalar
    const microcopies = [
        {
            key: "plan_saved",
            location: "plan_form",
            text: "Planın kaydedildi. Şimdi harekete geçme zamanı 💪",
        },
        {
            key: "confession_posted",
            location: "confession_wall",
            text: "Tatlı da seni haklı buldu 🍰",
        },
        {
            key: "welcome_message",
            location: "login",
            text: "Hoş geldin! Bugün biraz daha hafif hissedeceksin.",
        },
        {
            key: "first_plan",
            location: "plan_create",
            text: "İlk planını oluştur, yolculuğa başla! 🚀",
        },
        {
            key: "comment_posted",
            location: "comments",
            text: "Yorumun paylaşıldı. Motivasyon dağıtmaya devam! ✨",
        },
    ];

    for (const copy of microcopies) {
        await prisma.microCopy.upsert({
            where: { key: copy.key },
            update: copy,
            create: copy,
        });
    }

    console.log("✅ Mikro kopyalar eklendi");

    // Kullanıcı Hikayeleri
    const stories = [
        {
            name: "Ayşe K.",
            beforeWeight: 78,
            afterWeight: 65,
            duration: "6 ay",
            story:
                "Planımı yükledim, topluluktan destek aldım. 2 hafta sonra 75 kiloya düştüm. Şimdi diğerlerine ilham veriyorum.",
            quote: "Bu platform sadece bilgi değil, topluluk!",
            isFeatured: true,
            order: 1,
        },
        {
            name: "Mehmet Y.",
            beforeWeight: 95,
            afterWeight: 82,
            duration: "4 ay",
            story:
                "Günah duvarında itiraflarımı paylaştım, herkes çok destekleyici. Artık daha bilinçliyim.",
            quote: "Yalnız değilmişim, ne güzel!",
            isFeatured: true,
            order: 2,
        },
        {
            name: "Zeynep A.",
            beforeWeight: 68,
            afterWeight: 58,
            duration: "3 ay",
            story:
                "Tarif paylaşımları sayesinde sağlıklı yemek yapmayı öğrendim. Hem kilo verdim hem keyif aldım.",
            quote: "Sağlıklı beslenme bu kadar kolay olabilir!",
            isFeatured: true,
            order: 3,
        },
    ];

    for (const story of stories) {
        await prisma.userStory.create({
            data: story,
        });
    }

    console.log("✅ Kullanıcı hikayeleri eklendi");

    // Referanslar
    const testimonials = [
        {
            name: "Elif Yılmaz",
            role: "Öğretmen",
            text: "Bu site hayatımı değiştirdi. Gerçek insanlarla bağlantı kurmak çok motive edici!",
            rating: 5,
            order: 1,
        },
        {
            name: "Can Demir",
            role: "Yazılım Geliştirici",
            text: "XP sistemi sayesinde her gün giriş yapıyorum. Oyunlaştırma harika çalışmış!",
            rating: 5,
            order: 2,
        },
        {
            name: "Selin Kaya",
            role: "Pazarlama Uzmanı",
            text: "Günah duvarı çok eğlenceli. İtiraf etmek bu kadar rahatlatıcı olabilir!",
            rating: 5,
            order: 3,
        },
    ];

    for (const testimonial of testimonials) {
        await prisma.testimonial.create({
            data: testimonial,
        });
    }

    console.log("✅ Referanslar eklendi");

    // Tanıtım Bölümleri
    const sections = [
        {
            type: "HERO",
            title: "Plan değil, Yol Arkadaşı",
            subtitle: "Gerçek insanlardan, gerçek planlar",
            content:
                "Kendine özel kilo planını oluştur, paylaş, ilham al. Yalnız değilsin!",
            buttonText: "Hemen Başla",
            buttonUrl: "/register",
            order: 1,
        },
        {
            type: "VIDEO",
            title: "Yemek günahı mı işledin?",
            subtitle: "Pişman olma, paylaş!",
            content:
                "Gerçek insanlardan, gerçek planlar. Kendine özel kilo planını oluştur, paylaş, ilham al.",
            videoUrl: "https://www.youtube.com/embed/example",
            order: 2,
        },
    ];

    for (const section of sections) {
        await prisma.promoSection.create({
            data: section,
        });
    }

    console.log("✅ Tanıtım bölümleri eklendi");

    console.log("🎉 Tüm tanıtım verileri başarıyla eklendi!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
