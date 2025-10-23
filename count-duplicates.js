const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countDuplicates() {
  try {
    const allFoods = await prisma.food.findMany({
      select: { name: true }
    });

    const grouped = {};
    allFoods.forEach(food => {
      grouped[food.name] = (grouped[food.name] || 0) + 1;
    });

    const duplicates = Object.entries(grouped).filter(([name, count]) => count > 1);
    
    console.log(`📊 Toplam yemek: ${allFoods.length}`);
    console.log(`⚠️  Tekrarlayan: ${duplicates.length} farklı yemek`);
    console.log(`🗑️  Silinecek: ${duplicates.reduce((sum, [_, count]) => sum + (count - 1), 0)} kayıt`);
    
    if (duplicates.length > 0) {
      console.log('\nÖrnekler:');
      duplicates.slice(0, 10).forEach(([name, count]) => {
        console.log(`  - ${name}: ${count} adet`);
      });
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

countDuplicates();
