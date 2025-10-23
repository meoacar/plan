// Kapsamlı Türk yemekleri ve besinleri veritabanı
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foods = [
    // KAHVALTILIK (30 yemek)
    { name: 'Beyaz Ekmek', nameEn: 'White Bread', category: 'Kahvaltı', calories: 265, protein: 9, carbs: 49, fat: 3.2, servingSize: 100, isCommon: true },
    { name: 'Tam Buğday Ekmeği', nameEn: 'Whole Wheat Bread', category: 'Kahvaltı', calories: 247, protein: 13, carbs: 41, fat: 3.4, servingSize: 100, isCommon: true },
    { name: 'Çavdar Ekmeği', nameEn: 'Rye Bread', category: 'Kahvaltı', calories: 259, protein: 8.5, carbs: 48, fat: 3.3, servingSize: 100, isCommon: false },
    { name: 'Simit', nameEn: 'Turkish Bagel', category: 'Kahvaltı', calories: 290, protein: 9, carbs: 56, fat: 2.5, servingSize: 100, isCommon: true },
    { name: 'Poğaça', nameEn: 'Turkish Pastry', category: 'Kahvaltı', calories: 320, protein: 8, carbs: 45, fat: 12, servingSize: 100, isCommon: true },
    { name: 'Açma', nameEn: 'Turkish Roll', category: 'Kahvaltı', calories: 280, protein: 7.5, carbs: 52, fat: 4, servingSize: 100, isCommon: false },
    { name: 'Beyaz Peynir', nameEn: 'White Cheese', category: 'Kahvaltı', calories: 264, protein: 18, carbs: 1.5, fat: 21, servingSize: 100, isCommon: true },
    { name: 'Kaşar Peyniri', nameEn: 'Cheddar Cheese', category: 'Kahvaltı', calories: 374, protein: 23, carbs: 1.3, fat: 31, servingSize: 100, isCommon: true },
    { name: 'Tulum Peyniri', nameEn: 'Tulum Cheese', category: 'Kahvaltı', calories: 297, protein: 19, carbs: 2, fat: 24, servingSize: 100, isCommon: false },
    { name: 'Lor Peyniri', nameEn: 'Cottage Cheese', category: 'Kahvaltı', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: 100, isCommon: false },
    { name: 'Krem Peynir', nameEn: 'Cream Cheese', category: 'Kahvaltı', calories: 342, protein: 5.9, carbs: 5.5, fat: 34, servingSize: 100, isCommon: false },
    { name: 'Labne', nameEn: 'Strained Yogurt', category: 'Kahvaltı', calories: 159, protein: 7.5, carbs: 5.5, fat: 13, servingSize: 100, isCommon: false },
    { name: 'Yumurta (Haşlanmış)', nameEn: 'Boiled Egg', category: 'Kahvaltı', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Yumurta (Sahanda)', nameEn: 'Fried Egg', category: 'Kahvaltı', calories: 196, protein: 13.6, carbs: 0.8, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Omlet', nameEn: 'Omelette', category: 'Kahvaltı', calories: 154, protein: 10.6, carbs: 2.3, fat: 11.7, servingSize: 100, isCommon: true },
    { name: 'Menemen', nameEn: 'Turkish Scrambled Eggs', category: 'Kahvaltı', calories: 154, protein: 8, carbs: 7, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Sucuklu Yumurta', nameEn: 'Eggs with Sausage', category: 'Kahvaltı', calories: 280, protein: 15, carbs: 3, fat: 23, servingSize: 100, isCommon: true },
    { name: 'Sucuk', nameEn: 'Turkish Sausage', category: 'Kahvaltı', calories: 467, protein: 18, carbs: 1, fat: 43, servingSize: 100, isCommon: true },
    { name: 'Salam', nameEn: 'Salami', category: 'Kahvaltı', calories: 336, protein: 13, carbs: 2, fat: 31, servingSize: 100, isCommon: false },
    { name: 'Pastırma', nameEn: 'Pastrami', category: 'Kahvaltı', calories: 254, protein: 22, carbs: 0, fat: 18, servingSize: 100, isCommon: false },
    { name: 'Zeytin (Siyah)', nameEn: 'Black Olives', category: 'Kahvaltı', calories: 115, protein: 0.8, carbs: 6, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Zeytin (Yeşil)', nameEn: 'Green Olives', category: 'Kahvaltı', calories: 145, protein: 1, carbs: 4, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Tahin', nameEn: 'Tahini', category: 'Kahvaltı', calories: 595, protein: 17, carbs: 21, fat: 54, servingSize: 100, isCommon: false },
    { name: 'Pekmez', nameEn: 'Molasses', category: 'Kahvaltı', calories: 293, protein: 2.3, carbs: 71, fat: 0.4, servingSize: 100, isCommon: false },
    { name: 'Bal', nameEn: 'Honey', category: 'Kahvaltı', calories: 304, protein: 0.3, carbs: 82, fat: 0, servingSize: 100, isCommon: true },
    { name: 'Reçel', nameEn: 'Jam', category: 'Kahvaltı', calories: 278, protein: 0.4, carbs: 69, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Tereyağı', nameEn: 'Butter', category: 'Kahvaltı', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, servingSize: 100, isCommon: true },
    { name: 'Margarin', nameEn: 'Margarine', category: 'Kahvaltı', calories: 717, protein: 0.2, carbs: 0.9, fat: 80, servingSize: 100, isCommon: false },
    { name: 'Çiğ Köfte', nameEn: 'Raw Meatballs', category: 'Kahvaltı', calories: 180, protein: 5, carbs: 35, fat: 2, servingSize: 100, isCommon: false },
    { name: 'Gözleme (Peynirli)', nameEn: 'Turkish Pancake with Cheese', category: 'Kahvaltı', calories: 245, protein: 9, carbs: 32, fat: 9, servingSize: 100, isCommon: true },
];

async function main() {
    console.log('🍽️  Genişletilmiş yemek veritabanı seed başlıyor...');

    try {
        const existingCount = await prisma.food.count();
        console.log(`ℹ️  Mevcut yemek sayısı: ${existingCount}`);
    } catch (error) {
        console.log('ℹ️  Food tablosu kontrol edilemiyor, devam ediliyor...');
    }

    let addedCount = 0;
    for (const food of foods) {
        try {
            await prisma.food.create({
                data: food,
            });
            addedCount++;
        } catch (error) {
            // Zaten varsa sessizce atla
        }
    }

    console.log(`✅ ${addedCount} yeni yemek eklendi!`);
    console.log(`📊 Toplam: ${foods.length} yemek işlendi`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// ANA YEMEKLER - ET VE TAVUK (40 yemek) eklenecek
const moreFood = [
    // Et Yemekleri
    { name: 'Tavuk Göğsü (Izgara)', nameEn: 'Grilled Chicken Breast', category: 'Ana Yemek', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, isCommon: true },
    { name: 'Tavuk But (Fırın)', nameEn: 'Baked Chicken Thigh', category: 'Ana Yemek', calories: 209, protein: 26, carbs: 0, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Tavuk Şiş', nameEn: 'Chicken Skewer', category: 'Ana Yemek', calories: 180, protein: 28, carbs: 2, fat: 6, servingSize: 100, isCommon: true },
    { name: 'Tavuk Döner', nameEn: 'Chicken Doner', category: 'Ana Yemek', calories: 217, protein: 27, carbs: 3, fat: 10, servingSize: 100, isCommon: true },
    { name: 'Tavuk Sote', nameEn: 'Chicken Saute', category: 'Ana Yemek', calories: 195, protein: 24, carbs: 8, fat: 7, servingSize: 100, isCommon: true },
    { name: 'Kırmızı Et (Dana)', nameEn: 'Beef', category: 'Ana Yemek', calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Kuzu Eti', nameEn: 'Lamb', category: 'Ana Yemek', calories: 294, protein: 25, carbs: 0, fat: 21, servingSize: 100, isCommon: true },
    { name: 'Köfte', nameEn: 'Meatballs', category: 'Ana Yemek', calories: 295, protein: 17, carbs: 8, fat: 21, servingSize: 100, isCommon: true },
    { name: 'İnegöl Köfte', nameEn: 'Inegol Meatballs', category: 'Ana Yemek', calories: 310, protein: 18, carbs: 5, fat: 24, servingSize: 100, isCommon: true },
    { name: 'Adana Kebap', nameEn: 'Adana Kebab', category: 'Ana Yemek', calories: 320, protein: 19, carbs: 2, fat: 26, servingSize: 100, isCommon: true },
    { name: 'Urfa Kebap', nameEn: 'Urfa Kebab', category: 'Ana Yemek', calories: 305, protein: 20, carbs: 2, fat: 24, servingSize: 100, isCommon: false },
    { name: 'Şiş Kebap', nameEn: 'Shish Kebab', category: 'Ana Yemek', calories: 280, protein: 26, carbs: 1, fat: 19, servingSize: 100, isCommon: true },
    { name: 'Döner Kebap', nameEn: 'Doner Kebab', category: 'Ana Yemek', calories: 265, protein: 24, carbs: 4, fat: 17, servingSize: 100, isCommon: true },
    { name: 'İskender Kebap', nameEn: 'Iskender Kebab', category: 'Ana Yemek', calories: 290, protein: 22, carbs: 15, fat: 16, servingSize: 100, isCommon: true },
    { name: 'Pide (Kıymalı)', nameEn: 'Turkish Pizza with Meat', category: 'Ana Yemek', calories: 275, protein: 12, carbs: 35, fat: 10, servingSize: 100, isCommon: true },
    { name: 'Lahmacun', nameEn: 'Turkish Flatbread', category: 'Ana Yemek', calories: 235, protein: 9, carbs: 32, fat: 8, servingSize: 100, isCommon: true },
    { name: 'Mantı', nameEn: 'Turkish Dumplings', category: 'Ana Yemek', calories: 195, protein: 8, carbs: 28, fat: 5, servingSize: 100, isCommon: true },
    { name: 'Karnıyarık', nameEn: 'Stuffed Eggplant', category: 'Ana Yemek', calories: 180, protein: 8, carbs: 15, fat: 11, servingSize: 100, isCommon: true },
    { name: 'İmam Bayıldı', nameEn: 'Imam Bayildi', category: 'Ana Yemek', calories: 145, protein: 2, carbs: 12, fat: 10, servingSize: 100, isCommon: false },
    { name: 'Hünkar Beğendi', nameEn: 'Sultan's Delight', category: 'Ana Yemek', calories: 220, protein: 15, carbs: 12, fat: 13, servingSize: 100, isCommon: false },
    
    // Balık ve Deniz Ürünleri
    { name: 'Balık (Levrek)', nameEn: 'Sea Bass', category: 'Ana Yemek', calories: 97, protein: 18, carbs: 0, fat: 2.5, servingSize: 100, isCommon: true },
    { name: 'Somon', nameEn: 'Salmon', category: 'Ana Yemek', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: 100, isCommon: true },
    { name: 'Ton Balığı', nameEn: 'Tuna', category: 'Ana Yemek', calories: 144, protein: 23, carbs: 0, fat: 5, servingSize: 100, isCommon: true },
    { name: 'Hamsi (Kızartma)', nameEn: 'Fried Anchovy', category: 'Ana Yemek', calories: 195, protein: 17, carbs: 8, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Palamut', nameEn: 'Bonito', category: 'Ana Yemek', calories: 168, protein: 24, carbs: 0, fat: 8, servingSize: 100, isCommon: false },
    { name: 'Çipura', nameEn: 'Sea Bream', category: 'Ana Yemek', calories: 115, protein: 19, carbs: 0, fat: 4, servingSize: 100, isCommon: false },
    { name: 'Karides', nameEn: 'Shrimp', category: 'Ana Yemek', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Midye Dolma', nameEn: 'Stuffed Mussels', category: 'Ana Yemek', calories: 172, protein: 7, carbs: 24, fat: 5, servingSize: 100, isCommon: true },
    { name: 'Kalamar (Kızartma)', nameEn: 'Fried Calamari', category: 'Ana Yemek', calories: 175, protein: 15, carbs: 8, fat: 9, servingSize: 100, isCommon: false },
    { name: 'Ahtapot', nameEn: 'Octopus', category: 'Ana Yemek', calories: 82, protein: 15, carbs: 2.2, fat: 1, servingSize: 100, isCommon: false },
];
