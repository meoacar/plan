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
    
    // Daha Fazla Kahvaltılık
    { name: 'Simit', nameEn: 'Turkish Bagel', category: 'Kahvaltı', calories: 290, protein: 9, carbs: 56, fat: 2.5, servingSize: 100, isCommon: true },
    { name: 'Poğaça', nameEn: 'Turkish Pastry', category: 'Kahvaltı', calories: 320, protein: 8, carbs: 45, fat: 12, servingSize: 100, isCommon: true },
    { name: 'Gözleme', nameEn: 'Turkish Pancake', category: 'Kahvaltı', calories: 245, protein: 9, carbs: 32, fat: 9, servingSize: 100, isCommon: true },
    { name: 'Sucuk', nameEn: 'Turkish Sausage', category: 'Kahvaltı', calories: 467, protein: 18, carbs: 1, fat: 43, servingSize: 100, isCommon: true },
    { name: 'Omlet', nameEn: 'Omelette', category: 'Kahvaltı', calories: 154, protein: 10.6, carbs: 2.3, fat: 11.7, servingSize: 100, isCommon: true },
    { name: 'Tereyağı', nameEn: 'Butter', category: 'Kahvaltı', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, servingSize: 100, isCommon: true },
    { name: 'Tahin', nameEn: 'Tahini', category: 'Kahvaltı', calories: 595, protein: 17, carbs: 21, fat: 54, servingSize: 100, isCommon: false },
    { name: 'Pekmez', nameEn: 'Molasses', category: 'Kahvaltı', calories: 293, protein: 2.3, carbs: 71, fat: 0.4, servingSize: 100, isCommon: false },
    
    // Daha Fazla Ana Yemek
    { name: 'Tavuk But', nameEn: 'Chicken Thigh', category: 'Ana Yemek', calories: 209, protein: 26, carbs: 0, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Tavuk Şiş', nameEn: 'Chicken Skewer', category: 'Ana Yemek', calories: 180, protein: 28, carbs: 2, fat: 6, servingSize: 100, isCommon: true },
    { name: 'Adana Kebap', nameEn: 'Adana Kebab', category: 'Ana Yemek', calories: 320, protein: 19, carbs: 2, fat: 26, servingSize: 100, isCommon: true },
    { name: 'Şiş Kebap', nameEn: 'Shish Kebab', category: 'Ana Yemek', calories: 280, protein: 26, carbs: 1, fat: 19, servingSize: 100, isCommon: true },
    { name: 'Döner Kebap', nameEn: 'Doner Kebab', category: 'Ana Yemek', calories: 265, protein: 24, carbs: 4, fat: 17, servingSize: 100, isCommon: true },
    { name: 'İskender', nameEn: 'Iskender Kebab', category: 'Ana Yemek', calories: 290, protein: 22, carbs: 15, fat: 16, servingSize: 100, isCommon: true },
    { name: 'Lahmacun', nameEn: 'Turkish Flatbread', category: 'Ana Yemek', calories: 235, protein: 9, carbs: 32, fat: 8, servingSize: 100, isCommon: true },
    { name: 'Pide', nameEn: 'Turkish Pizza', category: 'Ana Yemek', calories: 275, protein: 12, carbs: 35, fat: 10, servingSize: 100, isCommon: true },
    { name: 'Mantı', nameEn: 'Turkish Dumplings', category: 'Ana Yemek', calories: 195, protein: 8, carbs: 28, fat: 5, servingSize: 100, isCommon: true },
    { name: 'Karnıyarık', nameEn: 'Stuffed Eggplant', category: 'Ana Yemek', calories: 180, protein: 8, carbs: 15, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Somon', nameEn: 'Salmon', category: 'Ana Yemek', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: 100, isCommon: true },
    { name: 'Ton Balığı', nameEn: 'Tuna', category: 'Ana Yemek', calories: 144, protein: 23, carbs: 0, fat: 5, servingSize: 100, isCommon: true },
    { name: 'Hamsi', nameEn: 'Anchovy', category: 'Ana Yemek', calories: 195, protein: 17, carbs: 8, fat: 11, servingSize: 100, isCommon: true },
    { name: 'Karides', nameEn: 'Shrimp', category: 'Ana Yemek', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Midye Dolma', nameEn: 'Stuffed Mussels', category: 'Ana Yemek', calories: 172, protein: 7, carbs: 24, fat: 5, servingSize: 100, isCommon: true },
    { name: 'Bulgur Pilavı', nameEn: 'Bulgur Pilaf', category: 'Ana Yemek', calories: 83, protein: 3, carbs: 19, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Patates (Haşlanmış)', nameEn: 'Boiled Potato', category: 'Ana Yemek', calories: 87, protein: 2, carbs: 20, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Patates Kızartması', nameEn: 'French Fries', category: 'Ana Yemek', calories: 312, protein: 3.4, carbs: 41, fat: 15, servingSize: 100, isCommon: true },
    { name: 'Ezogelin Çorbası', nameEn: 'Ezogelin Soup', category: 'Ana Yemek', calories: 95, protein: 4, carbs: 16, fat: 1.5, servingSize: 100, isCommon: true },
    { name: 'Yayla Çorbası', nameEn: 'Yayla Soup', category: 'Ana Yemek', calories: 78, protein: 3.5, carbs: 9, fat: 3, servingSize: 100, isCommon: false },
    { name: 'Tarhana Çorbası', nameEn: 'Tarhana Soup', category: 'Ana Yemek', calories: 102, protein: 4.5, carbs: 18, fat: 1.2, servingSize: 100, isCommon: true },
    
    // Daha Fazla Sebze
    { name: 'Soğan', nameEn: 'Onion', category: 'Sebze', calories: 40, protein: 1.1, carbs: 9, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Sarımsak', nameEn: 'Garlic', category: 'Sebze', calories: 149, protein: 6.4, carbs: 33, fat: 0.5, servingSize: 100, isCommon: true },
    { name: 'Karnabahar', nameEn: 'Cauliflower', category: 'Sebze', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Lahana', nameEn: 'Cabbage', category: 'Sebze', calories: 25, protein: 1.3, carbs: 6, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Kereviz', nameEn: 'Celery', category: 'Sebze', calories: 16, protein: 0.7, carbs: 3, fat: 0.2, servingSize: 100, isCommon: false },
    { name: 'Mantar', nameEn: 'Mushroom', category: 'Sebze', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Enginar', nameEn: 'Artichoke', category: 'Sebze', calories: 47, protein: 3.3, carbs: 11, fat: 0.2, servingSize: 100, isCommon: false },
    { name: 'Bamya', nameEn: 'Okra', category: 'Sebze', calories: 33, protein: 1.9, carbs: 7, fat: 0.2, servingSize: 100, isCommon: false },
    { name: 'Fasulye (Taze)', nameEn: 'Green Beans', category: 'Sebze', calories: 31, protein: 1.8, carbs: 7, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Bezelye', nameEn: 'Peas', category: 'Sebze', calories: 81, protein: 5, carbs: 14, fat: 0.4, servingSize: 100, isCommon: true },
    { name: 'Mısır', nameEn: 'Corn', category: 'Sebze', calories: 86, protein: 3.3, carbs: 19, fat: 1.4, servingSize: 100, isCommon: true },
    { name: 'Roka', nameEn: 'Arugula', category: 'Sebze', calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, servingSize: 100, isCommon: true },
    { name: 'Maydanoz', nameEn: 'Parsley', category: 'Sebze', calories: 36, protein: 3, carbs: 6, fat: 0.8, servingSize: 100, isCommon: true },
    
    // Daha Fazla Meyve
    { name: 'Armut', nameEn: 'Pear', category: 'Meyve', calories: 57, protein: 0.4, carbs: 15, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Şeftali', nameEn: 'Peach', category: 'Meyve', calories: 39, protein: 0.9, carbs: 10, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Kayısı', nameEn: 'Apricot', category: 'Meyve', calories: 48, protein: 1.4, carbs: 11, fat: 0.4, servingSize: 100, isCommon: true },
    { name: 'Kiraz', nameEn: 'Cherry', category: 'Meyve', calories: 63, protein: 1, carbs: 16, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Vişne', nameEn: 'Sour Cherry', category: 'Meyve', calories: 50, protein: 1, carbs: 12, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Erik', nameEn: 'Plum', category: 'Meyve', calories: 46, protein: 0.7, carbs: 11, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'İncir', nameEn: 'Fig', category: 'Meyve', calories: 74, protein: 0.8, carbs: 19, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Nar', nameEn: 'Pomegranate', category: 'Meyve', calories: 83, protein: 1.7, carbs: 19, fat: 1.2, servingSize: 100, isCommon: true },
    { name: 'Mandalina', nameEn: 'Mandarin', category: 'Meyve', calories: 53, protein: 0.8, carbs: 13, fat: 0.3, servingSize: 100, isCommon: true },
    { name: 'Greyfurt', nameEn: 'Grapefruit', category: 'Meyve', calories: 42, protein: 0.8, carbs: 11, fat: 0.1, servingSize: 100, isCommon: false },
    { name: 'Kivi', nameEn: 'Kiwi', category: 'Meyve', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, servingSize: 100, isCommon: true },
    { name: 'Ananas', nameEn: 'Pineapple', category: 'Meyve', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, servingSize: 100, isCommon: true },
    
    // Daha Fazla İçecek
    { name: 'Süt (Tam Yağlı)', nameEn: 'Whole Milk', category: 'İçecek', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: 100, isCommon: true },
    { name: 'Süt (Yağsız)', nameEn: 'Skim Milk', category: 'İçecek', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Yoğurt (Tam Yağlı)', nameEn: 'Full-Fat Yogurt', category: 'İçecek', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, servingSize: 100, isCommon: true },
    { name: 'Kefir', nameEn: 'Kefir', category: 'İçecek', calories: 41, protein: 3.3, carbs: 4.5, fat: 1, servingSize: 100, isCommon: false },
    { name: 'Elma Suyu', nameEn: 'Apple Juice', category: 'İçecek', calories: 46, protein: 0.1, carbs: 11, fat: 0.1, servingSize: 100, isCommon: true },
    { name: 'Vişne Suyu', nameEn: 'Cherry Juice', category: 'İçecek', calories: 50, protein: 0.5, carbs: 12, fat: 0.1, servingSize: 100, isCommon: false },
    { name: 'Şalgam Suyu', nameEn: 'Turnip Juice', category: 'İçecek', calories: 8, protein: 0.5, carbs: 1.5, fat: 0, servingSize: 100, isCommon: false },
    { name: 'Limonata', nameEn: 'Lemonade', category: 'İçecek', calories: 40, protein: 0.1, carbs: 10, fat: 0, servingSize: 100, isCommon: true },
    { name: 'Çay (Şekerli)', nameEn: 'Tea with Sugar', category: 'İçecek', calories: 30, protein: 0, carbs: 7.5, fat: 0, servingSize: 100, isCommon: true },
    { name: 'Türk Kahvesi', nameEn: 'Turkish Coffee', category: 'İçecek', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: 100, isCommon: true },
    
    // Daha Fazla Atıştırmalık
    { name: 'Antep Fıstığı', nameEn: 'Pistachio', category: 'Atıştırmalık', calories: 562, protein: 20, carbs: 28, fat: 45, servingSize: 100, isCommon: true },
    { name: 'Kaju', nameEn: 'Cashew', category: 'Atıştırmalık', calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: 100, isCommon: true },
    { name: 'Ay Çekirdeği', nameEn: 'Sunflower Seeds', category: 'Atıştırmalık', calories: 584, protein: 21, carbs: 20, fat: 51, servingSize: 100, isCommon: true },
    { name: 'Kabak Çekirdeği', nameEn: 'Pumpkin Seeds', category: 'Atıştırmalık', calories: 559, protein: 30, carbs: 11, fat: 49, servingSize: 100, isCommon: true },
    { name: 'Kuru Üzüm', nameEn: 'Raisins', category: 'Atıştırmalık', calories: 299, protein: 3.1, carbs: 79, fat: 0.5, servingSize: 100, isCommon: true },
    { name: 'Kuru Kayısı', nameEn: 'Dried Apricot', category: 'Atıştırmalık', calories: 241, protein: 3.4, carbs: 63, fat: 0.5, servingSize: 100, isCommon: true },
    { name: 'Kuru İncir', nameEn: 'Dried Fig', category: 'Atıştırmalık', calories: 249, protein: 3.3, carbs: 64, fat: 0.9, servingSize: 100, isCommon: true },
    { name: 'Hurma', nameEn: 'Date', category: 'Atıştırmalık', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, servingSize: 100, isCommon: true },
    { name: 'Çikolata (Sütlü)', nameEn: 'Milk Chocolate', category: 'Atıştırmalık', calories: 535, protein: 7.6, carbs: 59, fat: 30, servingSize: 100, isCommon: true },
    { name: 'Gofret', nameEn: 'Wafer', category: 'Atıştırmalık', calories: 525, protein: 5.5, carbs: 64, fat: 27, servingSize: 100, isCommon: true },
    { name: 'Kraker', nameEn: 'Crackers', category: 'Atıştırmalık', calories: 502, protein: 9, carbs: 62, fat: 23, servingSize: 100, isCommon: true },
    { name: 'Cips', nameEn: 'Chips', category: 'Atıştırmalık', calories: 536, protein: 6.6, carbs: 53, fat: 34, servingSize: 100, isCommon: true },
    { name: 'Patlamış Mısır', nameEn: 'Popcorn', category: 'Atıştırmalık', calories: 387, protein: 13, carbs: 78, fat: 4.5, servingSize: 100, isCommon: true },
];

async function main() {
    console.log('🍽️  Yemek veritabanı seed başlıyor...');

    // Önce mevcut yemekleri kontrol et
    try {
        const existingCount = await prisma.food.count();

        if (existingCount > 0) {
            console.log(`ℹ️  Veritabanında zaten ${existingCount} yemek var. Atlanıyor...`);
            return;
        }
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
            console.log(`⚠️  ${food.name} eklenemedi (muhtemelen zaten var)`);
        }
    }

    console.log(`✅ ${addedCount} yemek eklendi!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
