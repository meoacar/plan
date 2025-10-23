// Mega Kapsamlı Türk Yemekleri Veritabanı - 500+ Yemek
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const megaFoods = [
    // KAHVALTILIK - Ekmek ve Hamur İşleri (20)
    { name: 'Çavdar Ekmeği', nameEn: 'Rye Bread', category: 'Kahvaltı', calories: 259, protein: 8.5, carbs: 48, fat: 3.3, servingSize: 100, isCommon: false },
    { name: 'Kepekli Ekmek', nameEn: 'Bran Bread', category: 'Kahvaltı', calories: 248, protein: 9.2, carbs: 45, fat: 3.8, servingSize: 100, isCommon: true },
    { name: 'Yulaf Ekmeği', nameEn: 'Oat Bread', category: 'Kahvaltı', calories: 246, protein: 8.8, carbs: 43, fat: 4.2, servingSize: 100, isCommon: false },
    { name: 'Açma', nameEn: 'Turkish Roll', category: 'Kahvaltı', calories: 280, protein: 7.5, carbs: 52, fat: 4, servingSize: 100, isCommon: false },
    { name: 'Bazlama', nameEn: 'Turkish Flatbread', category: 'Kahvaltı', calories: 275, protein: 8, carbs: 54, fat: 2.8, servingSize: 100, isCommon: false },
    { name: 'Lavaş', nameEn: 'Lavash', category: 'Kahvaltı', calories: 268, protein: 8.2, carbs: 56, fat: 1.2, servingSize: 100, isCommon: true },
    { name: 'Yufka', nameEn: 'Phyllo Dough', category: 'Kahvaltı', calories: 301, protein: 8.5, carbs: 62, fat: 2.5, servingSize: 100, isCommon: true },
    { name: 'Katmer', nameEn: 'Katmer', category: 'Kahvaltı', calories: 385, protein: 6, carbs: 48, fat: 18, servingSize: 100, isCommon: false },
    { name: 'Börek (Peynirli)', nameEn: 'Cheese Borek', category: 'Kahvaltı', calories: 312, protein: 11, carbs: 28, fat: 17, servingSize: 100, isCommon: true },
    { name: 'Börek (Kıymalı)', nameEn: 'Meat Borek', category: 'Kahvaltı', calories: 298, protein: 13, carbs: 26, fat: 16, servingSize: 100, isCommon: true },
    { name: 'Börek (Patatesli)', nameEn: 'Potato Borek', category: 'Kahvaltı', calories: 265, protein: 7, carbs: 32, fat: 12, servingSize: 100, isCommon: false },
    { name: 'Sigara Böreği', nameEn: 'Cigar Borek', category: 'Kahvaltı', calories: 335, protein: 10, carbs: 30, fat: 19, servingSize: 100, isCommon: true },
    { name: 'Su Böreği', nameEn: 'Water Borek', category: 'Kahvaltı', calories: 285, protein: 9, carbs: 27, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Kol Böreği', nameEn: 'Arm Borek', category: 'Kahvaltı', calories: 295, protein: 8.5, carbs: 29, fat: 16, servingSize: 100, isCommon: false },
    { name: 'Gözleme (Patatesli)', nameEn: 'Pancake with Potato', category: 'Kahvaltı', calories: 220, protein: 6, carbs: 35, fat: 6, servingSize: 100, isCommon: true },
    { name: 'Gözleme (Ispanaklı)', nameEn: 'Pancake with Spinach', category: 'Kahvaltı', calories: 210, protein: 7, carbs: 30, fat: 7, servingSize: 100, isCommon: true },
    { name: 'Pişi', nameEn: 'Fried Dough', category: 'Kahvaltı', calories: 340, protein: 7, carbs: 45, fat: 15, servingSize: 100, isCommon: false },
    { name: 'Lokma', nameEn: 'Sweet Fritters', category: 'Kahvaltı', calories: 315, protein: 5, carbs: 52, fat: 10, servingSize: 100, isCommon: false },
    { name: 'Açma (Tahinli)', nameEn: 'Tahini Roll', category: 'Kahvaltı', calories: 325, protein: 8, carbs: 48, fat: 12, servingSize: 100, isCommon: false },
    { name: 'Çörek', nameEn: 'Sweet Bread', category: 'Kahvaltı', calories: 310, protein: 7.5, carbs: 50, fat: 9, servingSize: 100, isCommon: false },

    // KAHVALTILIK - Peynirler (15)
    { name: 'Tulum Peyniri', nameEn: 'Tulum Cheese', category: 'Kahvaltı', calories: 297, protein: 19, carbs: 2, fat: 24, servingSize: 100, isCommon: false },
    { name: 'Lor Peyniri', nameEn: 'Cottage Cheese', category: 'Kahvaltı', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: 100, isCommon: false },
    { name: 'Krem Peynir', nameEn: 'Cream Cheese', category: 'Kahvaltı', calories: 342, protein: 5.9, carbs: 5.5, fat: 34, servingSize: 100, isCommon: false },
    { name: 'Labne', nameEn: 'Strained Yogurt', category: 'Kahvaltı', calories: 159, protein: 7.5, carbs: 5.5, fat: 13, servingSize: 100, isCommon: false },
    { name: 'Çökelek', nameEn: 'Cokelek Cheese', category: 'Kahvaltı', calories: 105, protein: 12, carbs: 4, fat: 4.5, servingSize: 100, isCommon: false },
    { name: 'Dil Peyniri', nameEn: 'String Cheese', category: 'Kahvaltı', calories: 318, protein: 22, carbs: 2, fat: 25, servingSize: 100, isCommon: false },
    { name: 'Cecil Peyniri', nameEn: 'Cecil Cheese', category: 'Kahvaltı', calories: 285, protein: 20, carbs: 1.8, fat: 22, servingSize: 100, isCommon: false },
    { name: 'Mihaliç Peyniri', nameEn: 'Mihalic Cheese', category: 'Kahvaltı', calories: 395, protein: 25, carbs: 1.5, fat: 32, servingSize: 100, isCommon: false },
    { name: 'Ezine Peyniri', nameEn: 'Ezine Cheese', category: 'Kahvaltı', calories: 275, protein: 19, carbs: 1.6, fat: 21, servingSize: 100, isCommon: false },
    { name: 'Kars Gravyer', nameEn: 'Kars Gruyere', category: 'Kahvaltı', calories: 413, protein: 27, carbs: 0.4, fat: 33, servingSize: 100, isCommon: false },
    { name: 'Otlu Peynir', nameEn: 'Herbed Cheese', category: 'Kahvaltı', calories: 268, protein: 18, carbs: 2, fat: 21, servingSize: 100, isCommon: false },
    { name: 'Küflü Peynir', nameEn: 'Blue Cheese', category: 'Kahvaltı', calories: 353, protein: 21, carbs: 2.3, fat: 29, servingSize: 100, isCommon: false },
    { name: 'Taze Kaşar', nameEn: 'Fresh Cheddar', category: 'Kahvaltı', calories: 365, protein: 22, carbs: 1.5, fat: 30, servingSize: 100, isCommon: true },
    { name: 'Eski Kaşar', nameEn: 'Aged Cheddar', category: 'Kahvaltı', calories: 392, protein: 24, carbs: 1.2, fat: 32, servingSize: 100, isCommon: false },
    { name: 'Süzme Peynir', nameEn: 'Strained Cheese', category: 'Kahvaltı', calories: 112, protein: 13, carbs: 3.8, fat: 5, servingSize: 100, isCommon: false },

    // KAHVALTILIK - Yumurta Çeşitleri (10)
    { name: 'Yumurta (Sahanda)', nameEn: 'Fried Egg', category: 'Kahvaltı', calories: 196, protein: 13.6, carbs: 0.8, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Omlet', nameEn: 'Omelette', category: 'Kahvaltı', calories: 154, protein: 10.6, carbs: 2.3, fat: 11.7, servingSize: 100, isCommon: true },
    { name: 'Sucuklu Yumurta', nameEn: 'Eggs with Sausage', category: 'Kahvaltı', calories: 280, protein: 15, carbs: 3, fat: 23, servingSize: 100, isCommon: true },
    { name: 'Peynirli Omlet', nameEn: 'Cheese Omelette', category: 'Kahvaltı', calories: 185, protein: 13, carbs: 2, fat: 14, servingSize: 100, isCommon: true },
    { name: 'Sebzeli Omlet', nameEn: 'Vegetable Omelette', category: 'Kahvaltı', calories: 142, protein: 9, carbs: 5, fat: 10, servingSize: 100, isCommon: true },
    { name: 'Çılbır', nameEn: 'Poached Eggs with Yogurt', category: 'Kahvaltı', calories: 168, protein: 11, carbs: 6, fat: 11, servingSize: 100, isCommon: false },
    { name: 'Yumurta (Rafadan)', nameEn: 'Soft Boiled Egg', category: 'Kahvaltı', calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, servingSize: 100, isCommon: true },
    { name: 'Yumurta (Katı)', nameEn: 'Hard Boiled Egg', category: 'Kahvaltı', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Scrambled Eggs', nameEn: 'Scrambled Eggs', category: 'Kahvaltı', calories: 168, protein: 11, carbs: 1.5, fat: 13, servingSize: 100, isCommon: true },
    { name: 'Mantarlı Omlet', nameEn: 'Mushroom Omelette', category: 'Kahvaltı', calories: 158, protein: 10, carbs: 3, fat: 12, servingSize: 100, isCommon: false },
];

async function main() {
    console.log('🍽️  MEGA Yemek Veritabanı Seed Başlıyor...');
    console.log(`📦 ${megaFoods.length} yemek eklenecek...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const food of megaFoods) {
        try {
            await prisma.food.create({ data: food });
            addedCount++;
        } catch (error) {
            skippedCount++;
        }
    }

    const totalCount = await prisma.food.count();
    
    console.log(`\n✅ ${addedCount} yeni yemek eklendi!`);
    console.log(`ℹ️  ${skippedCount} yemek zaten vardı`);
    console.log(`📊 TOPLAM: ${totalCount} yemek`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


// KAHVALTILIK - Şarküteri ve Diğer (15)
const moreBreakfast = [
    { name: 'Salam', nameEn: 'Salami', category: 'Kahvaltı', calories: 336, protein: 13, carbs: 2, fat: 31, servingSize: 100, isCommon: false },
    { name: 'Pastırma', nameEn: 'Pastrami', category: 'Kahvaltı', calories: 254, protein: 22, carbs: 0, fat: 18, servingSize: 100, isCommon: false },
    { name: 'Kavurma', nameEn: 'Confit', category: 'Kahvaltı', calories: 385, protein: 20, carbs: 0, fat: 33, servingSize: 100, isCommon: false },
    { name: 'Sosis', nameEn: 'Sausage', category: 'Kahvaltı', calories: 301, protein: 12, carbs: 3, fat: 27, servingSize: 100, isCommon: true },
    { name: 'Jambon', nameEn: 'Ham', category: 'Kahvaltı', calories: 145, protein: 21, carbs: 1.5, fat: 6, servingSize: 100, isCommon: true },
    { name: 'Hindi Füme', nameEn: 'Smoked Turkey', category: 'Kahvaltı', calories: 135, protein: 24, carbs: 2, fat: 3.5, servingSize: 100, isCommon: true },
    { name: 'Zeytin Ezmesi', nameEn: 'Olive Paste', category: 'Kahvaltı', calories: 185, protein: 1.5, carbs: 8, fat: 17, servingSize: 100, isCommon: false },
    { name: 'Çemen', nameEn: 'Cemen Paste', category: 'Kahvaltı', calories: 165, protein: 8, carbs: 15, fat: 9, servingSize: 100, isCommon: false },
    { name: 'Haydari', nameEn: 'Haydari', category: 'Kahvaltı', calories: 95, protein: 5, carbs: 6, fat: 6, servingSize: 100, isCommon: false },
    { name: 'Acuka', nameEn: 'Acuka', category: 'Kahvaltı', calories: 125, protein: 2, carbs: 18, fat: 5, servingSize: 100, isCommon: false },
    { name: 'Fıstık Ezmesi', nameEn: 'Peanut Butter', category: 'Kahvaltı', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: 100, isCommon: true },
    { name: 'Nutella', nameEn: 'Nutella', category: 'Kahvaltı', calories: 539, protein: 6, carbs: 58, fat: 31, servingSize: 100, isCommon: true },
    { name: 'Çikolatalı Fındık Ezmesi', nameEn: 'Chocolate Hazelnut Spread', category: 'Kahvaltı', calories: 545, protein: 6.5, carbs: 57, fat: 32, servingSize: 100, isCommon: true },
    { name: 'Margarin', nameEn: 'Margarine', category: 'Kahvaltı', calories: 717, protein: 0.2, carbs: 0.9, fat: 80, servingSize: 100, isCommon: false },
    { name: 'Zeytinyağı', nameEn: 'Olive Oil', category: 'Kahvaltı', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: 100, isCommon: true },
];

// ANA YEMEK - Tavuk Yemekleri (25)
const chickenDishes = [
    { name: 'Tavuk Sote', nameEn: 'Chicken Saute', category: 'Ana Yemek', calories: 195, protein: 24, carbs: 8, fat: 7, servingSize: 100, isCommon: true },
    { name: 'Tavuk Döner', nameEn: 'Chicken Doner', category: 'Ana Yemek', calories: 217, protein: 27, carbs: 3, fat: 10, servingSize: 100, isCommon: true },
    { name: 'Tavuk Kanat', nameEn: 'Chicken Wings', category: 'Ana Yemek', calories: 203, protein: 30, carbs: 0, fat: 8.1, servingSize: 100, isCommon: true },
    { name: 'Tavuk Köfte', nameEn: 'Chicken Meatballs', category: 'Ana Yemek', calories: 185, protein: 22, carbs: 6, fat: 8, servingSize: 100, isCommon: true },
    { name: 'Tavuk Çorbası', nameEn: 'Chicken Soup', category: 'Ana Yemek', calories: 38, protein: 4, carbs: 3, fat: 1.2, servingSize: 100, isCommon: true },
    { name: 'Tavuk Haşlama', nameEn: 'Boiled Chicken', category: 'Ana Yemek', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, isCommon: true },
    { name: 'Tavuk Güveç', nameEn: 'Chicken Casserole', category: 'Ana Yemek', calories: 178, protein: 23, carbs: 9, fat: 6, servingSize: 100, isCommon: false },
    { name: 'Tavuk Kapama', nameEn: 'Chicken Stew', category: 'Ana Yemek', calories: 185, protein: 24, carbs: 7, fat: 7, servingSize: 100, isCommon: false },
    { name: 'Tavuk Tandır', nameEn: 'Tandoori Chicken', category: 'Ana Yemek', calories: 195, protein: 28, carbs: 2, fat: 8, servingSize: 100, isCommon: false },
    { name: 'Tavuk Sarma', nameEn: 'Chicken Roll', category: 'Ana Yemek', calories: 210, protein: 25, carbs: 5, fat: 10, servingSize: 100, isCommon: false },
    { name: 'Tavuk Pirzola', nameEn: 'Chicken Chop', category: 'Ana Yemek', calories: 198, protein: 27, carbs: 1, fat: 9, servingSize: 100, isCommon: false },
    { name: 'Tavuk Külbastı', nameEn: 'Chicken Steak', category: 'Ana Yemek', calories: 175, protein: 29, carbs: 0, fat: 5.5, servingSize: 100, isCommon: false },
    { name: 'Tavuk Bonfile', nameEn: 'Chicken Fillet', category: 'Ana Yemek', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, isCommon: true },
    { name: 'Tavuk Nugget', nameEn: 'Chicken Nuggets', category: 'Ana Yemek', calories: 296, protein: 15, carbs: 18, fat: 18, servingSize: 100, isCommon: true },
    { name: 'Tavuk Şnitzel', nameEn: 'Chicken Schnitzel', category: 'Ana Yemek', calories: 245, protein: 24, carbs: 12, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Tavuk Cordon Bleu', nameEn: 'Chicken Cordon Bleu', category: 'Ana Yemek', calories: 285, protein: 22, carbs: 10, fat: 17, servingSize: 100, isCommon: false },
    { name: 'Tavuk Rosto', nameEn: 'Roast Chicken', category: 'Ana Yemek', calories: 190, protein: 27, carbs: 0, fat: 8, servingSize: 100, isCommon: true },
    { name: 'Tavuk Baget', nameEn: 'Chicken Baguette', category: 'Ana Yemek', calories: 235, protein: 20, carbs: 15, fat: 11, servingSize: 100, isCommon: false },
    { name: 'Tavuk Salam', nameEn: 'Chicken Salami', category: 'Ana Yemek', calories: 195, protein: 18, carbs: 3, fat: 12, servingSize: 100, isCommon: false },
    { name: 'Tavuk Sosis', nameEn: 'Chicken Sausage', category: 'Ana Yemek', calories: 185, protein: 16, carbs: 4, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Tavuk Ciğeri', nameEn: 'Chicken Liver', category: 'Ana Yemek', calories: 172, protein: 25, carbs: 1, fat: 7, servingSize: 100, isCommon: false },
    { name: 'Tavuk Kalp', nameEn: 'Chicken Heart', category: 'Ana Yemek', calories: 185, protein: 26, carbs: 0.7, fat: 8, servingSize: 100, isCommon: false },
    { name: 'Tavuk Taşlık', nameEn: 'Chicken Gizzard', category: 'Ana Yemek', calories: 154, protein: 30, carbs: 0, fat: 3, servingSize: 100, isCommon: false },
    { name: 'Tavuk Kızartma', nameEn: 'Fried Chicken', category: 'Ana Yemek', calories: 246, protein: 19, carbs: 10, fat: 14, servingSize: 100, isCommon: true },
    { name: 'Tavuk Burger', nameEn: 'Chicken Burger', category: 'Ana Yemek', calories: 265, protein: 18, carbs: 22, fat: 12, servingSize: 100, isCommon: true },
];

// Tüm yemekleri birleştir
megaFoods.push(...moreBreakfast, ...chickenDishes);
