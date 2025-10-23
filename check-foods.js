const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFoods() {
  try {
    const count = await prisma.food.count();
    console.log('✅ Toplam yemek sayısı:', count);
    
    if (count > 0) {
      const foods = await prisma.food.findMany({
        take: 5,
        select: { name: true, category: true, calories: true }
      });
      console.log('\n📋 İlk 5 yemek:');
      foods.forEach(f => console.log(`  - ${f.name} (${f.category}): ${f.calories} kcal`));
    } else {
      console.log('⚠️  Veritabanında yemek yok!');
    }
    
    // Kalori hedefi kontrolü
    const goalCount = await prisma.calorieGoal.count();
    console.log('\n🎯 Kalori hedefi sayısı:', goalCount);
    
    // Öğün kontrolü
    const mealCount = await prisma.meal.count();
    console.log('🍽️  Öğün sayısı:', mealCount);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFoods();
