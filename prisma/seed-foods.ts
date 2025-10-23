// Yaygın Türk yemekleri ve besinleri için seed verisi
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foods = [
    // Kahvaltılık
    { name: 'Beyaz Ekmek', nameEn: 'White Bread', category: 'Kahvaltı', calories: 265, protein: 9, carbs: 49, fat: 3.2, servingSize: 100, isCommon: true },
    { name: 'Tam Buğday Ekmeği', nameEn: 'Whole Wheat Bread', category: 'Kahvaltı', calories: 247, protein: 13, carbs: 41, fat: 3.4, servingSize: 100, isCommon: true },
    { name: 'Beyaz Peynir', nameEn: 'White Cheese', category: 'Kahvaltı', calories: 264, protein: 18, carbs: 1.5, fat: 21, servingSize: 100, isCommon: true },
    { name: 'Kaşar Peyniri', nameEn: 'Cheddar Cheese', category: 'Kahvaltı', calories: 374, protein: 23, carbs: 1.3, fat: 31, servingSize: 100, isCommon: true },
    { name: 'Yumurta (Haşlanmış)', nameEn: 'Boiled Egg', category: 'Kahvaltı', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Menemen', nameEn: 'Turkish Scrambled Eggs', category: 'Kahvaltı', calories: 154, protein: 8, carbs: 7, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Zeytin', nameEn: 'Olives', category: 'Kahvaltı', calories: 115, protein: 0.8, carbs: 6, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Bal', nameEn: 'Honey', category: 'Kahvaltı', calories: 304, protein: 0.3, carbs: 82, fat: 0, servingSize: 100, isCommon: true },
    { name: 'Reçel', nameEn: 'Jam', category: 'Kahvaltı', calories: 278, protein: 0.4, carbs: 69, fat: 0.1, servingSize: 100, isCommon: true },

    // Ana Yemekler
    { name: 'Tavuk Göğsü (Izgara)', nameEn: 'Grilled Chicken Breast', category: 'Ana Yemek', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, isCommon: true },
    { name: 'Kırmızı Et (Dana)', nameEn: 'Beef', category: 'Ana Yemek', calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Köfte', nameEn: 'Meatballs', category: 'Ana Yemek', calories: 295, protein: 17, carbs: 8, fat: 21, servingSize: 100, isCommon: true },
    { name: 'Balık (Levrek)', nameEn: 'Sea Bass', category: 'Ana Yemek', calories: 97, protein: 18, carbs: 0, fat: 2.5, servingSize: 100, isCommon: true },
    { name: 'Pilav', nameEn: 'Rice Pilaf', category: 'Ana Yemek', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Makarna', nameEn: 'Pasta', category: 'Ana Yemek', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: 100, isCommon: true },
    { name: 'Mercimek Çorbası', nameEn: 'Lentil Soup', category: 'Ana Yemek', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: 100, isCommon: true },
    { name: 'Kuru Fasulye', nameEn: 'White Bean Stew', category: 'Ana Yemek', calories: 127, protein: 8.7, carbs: 23, fat: 0.5, servingSize: 100, isCommon: true },
    { name: 'Nohut', nameEn: 'Chickpeas', category: 'Ana Yemek', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: 100, isCommon: true },

    // Sebzeler
    { name: 'Domates', nameEn: 'Tomato', category: 'Sebze', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Salatalık', nameEn: 'Cucumber', category: 'Sebze', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Marul', nameEn: 'Lettuce', category: 'Sebze', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Biber', nameEn: 'Pepper', category: 'Sebze', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Patlıcan', nameEn: 'Eggplant', category: 'Sebze', calories: 25, protein: 1, carbs: 6, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Kabak', nameEn: 'Zucchini', category: 'Sebze', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Havuç', nameEn: 'Carrot', category: 'Sebze', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Brokoli', nameEn: 'Broccoli', category: 'Sebze', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: 100, isCommon: true },
    { name: 'Ispanak', nameEn: 'Spinach', category: 'Sebze', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: 100, isCommon: true },

    // Meyveler
    { name: 'Elma', nameEn: 'Apple', category: 'Meyve', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Muz', nameEn: 'Banana', category: 'Meyve', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Portakal', nameEn: 'Orange', category: 'Meyve', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Çilek', nameEn: 'Strawberry', category: 'Meyve', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Karpuz', nameEn: 'Watermelon', category: 'Meyve', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Kavun', nameEn: 'Melon', category: 'Meyve', calories: 34, protein: 0.8, carbs: 8, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Üzüm', nameEn: 'Grapes', category: 'Meyve', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, servingSize: 100, isCommon: true },

    // İçecekler
    { name: 'Süt (Yarım Yağlı)', nameEn: 'Semi-Skimmed Milk', category: 'İçecek', calories: 50, protein: 3.4, carbs: 5, fat: 1.8, servingSize: 100, isCommon: true },
    { name: 'Yoğurt (Az Yağlı)', nameEn: 'Low-Fat Yogurt', category: 'İçecek', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: 100, isCommon: true },
    { name: 'Ayran', nameEn: 'Ayran', category: 'İçecek', calories: 38, protein: 1.7, carbs: 2.8, fat: 2.2, servingSize: 100, isCommon: true },
    { name: 'Çay (Şekersiz)', nameEn: 'Tea (Unsweetened)', category: 'İçecek', calories: 1, protein: 0, carbs: 0.3, fat: 0, servingSize: 100, isCommon: true },
    { name: 'Kahve (Sade)', nameEn: 'Black Coffee', category: 'İçecek', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: 100, isCommon: true },
    { name: 'Portakal Suyu', nameEn: 'Orange Juice', category: 'İçecek', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, servingSize: 100, isCommon: true },

    // Atıştırmalıklar
    { name: 'Fındık', nameEn: 'Hazelnuts', category: 'Atıştırmalık', calories: 628, protein: 15, carbs: 17, fat: 61, servingSize: 100, isCommon: true },
    { name: 'Badem', nameEn: 'Almonds', category: 'Atıştırmalık', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 100, isCommon: true },
    { name: 'Ceviz', nameEn: 'Walnuts', category: 'Atıştırmalık', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 100, isCommon: true },
    { name: 'Çikolata (Bitter)', nameEn: 'Dark Chocolate', category: 'Atıştırmalık', calories: 546, protein: 5, carbs: 61, fat: 31, servingSize: 100, isCommon: true },
    { name: 'Bisküvi', nameEn: 'Biscuits', category: 'Atıştırmalık', calories: 502, protein: 6.5, carbs: 64, fat: 24, servingSize: 100, isCommon: true },
];

async function main() {
    console.log('🍽️  Yemek veritabanı seed başlıyor...');

    // Önce mevcut yemekleri kontrol et
    const existingCount = await prisma.food.count();

    if (existingCount > 0) {
        console.log(`ℹ️  Veritabanında zaten ${existingCount} yemek var. Yeni yemekler ekleniyor...`);
    }

    for (const food of foods) {
        await prisma.food.create({
            data: food,
        });
    }

    console.log(`✅ ${foods.length} yemek eklendi!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
