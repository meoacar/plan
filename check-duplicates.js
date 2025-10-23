const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    // Tüm yemekleri al
    const allFoods = await prisma.food.findMany({
      select: { id: true, name: true, calories: true, category: true }
    });

    // İsme göre grupla
    const grouped = {};
    allFoods.forEach(food => {
      if (!grouped[food.name]) {
        grouped[food.name] = [];
      }
      grouped[food.name].push(food);
    });

    // Duplicate olanları bul
    const duplicates = Object.entries(grouped).filter(([name, foods]) => foods.length > 1);

    if (duplicates.length > 0) {
      console.log(`⚠️  ${duplicates.length} tekrarlayan yemek bulundu:\n`);
      
      duplicates.forEach(([name, foods]) => {
        console.log(`📌 ${name} (${foods.length} adet):`);
        foods.forEach(f => console.log(`   - ID: ${f.id}, Kalori: ${f.calories}, Kategori: ${f.category}`));
        console.log('');
      });

      // Temizleme önerisi
      console.log('\n🧹 Temizleme yapılacak...');
      let deletedCount = 0;

      for (const [name, foods] of duplicates) {
        // İlkini tut, diğerlerini sil
        const toDelete = foods.slice(1);
        for (const food of toDelete) {
          await prisma.food.delete({ where: { id: food.id } });
          deletedCount++;
        }
      }

      console.log(`✅ ${deletedCount} tekrarlayan yemek silindi!`);
    } else {
      console.log('✅ Tekrarlayan yemek yok!');
    }

    const finalCount = await prisma.food.count();
    console.log(`\n📊 Toplam yemek sayısı: ${finalCount}`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
