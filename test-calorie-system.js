const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCalorieSystem() {
  try {
    console.log('🧪 Kalori takip sistemi test ediliyor...\n');
    
    // Admin kullanıcısını bul
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      return;
    }
    
    console.log('✅ Test kullanıcısı:', admin.email);
    
    // Kalori hedefi oluştur
    const existingGoal = await prisma.calorieGoal.findUnique({
      where: { userId: admin.id }
    });
    
    if (!existingGoal) {
      const goal = await prisma.calorieGoal.create({
        data: {
          userId: admin.id,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyCarbs: 200,
          dailyFat: 65,
          activityLevel: 'moderate'
        }
      });
      console.log('✅ Kalori hedefi oluşturuldu:', goal.dailyCalories, 'kcal');
    } else {
      console.log('ℹ️  Kalori hedefi zaten var:', existingGoal.dailyCalories, 'kcal');
    }
    
    // Bugün için öğün var mı kontrol et
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingMeal = await prisma.meal.findFirst({
      where: {
        userId: admin.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    if (!existingMeal) {
      // Örnek yemekler al
      const foods = await prisma.food.findMany({
        where: {
          name: { in: ['Beyaz Ekmek', 'Beyaz Peynir', 'Yumurta (Haşlanmış)'] }
        }
      });
      
      if (foods.length > 0) {
        // Kahvaltı öğünü oluştur
        const meal = await prisma.meal.create({
          data: {
            userId: admin.id,
            date: today,
            mealType: 'Kahvaltı',
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            note: 'Test kahvaltısı',
            entries: {
              create: foods.map(food => ({
                foodId: food.id,
                foodName: food.name,
                amount: 100,
                calories: food.calories,
                protein: food.protein || 0,
                carbs: food.carbs || 0,
                fat: food.fat || 0
              }))
            }
          },
          include: {
            entries: true
          }
        });
        
        // Toplamları hesapla ve güncelle
        const totalCalories = meal.entries.reduce((sum, e) => sum + e.calories, 0);
        const totalProtein = meal.entries.reduce((sum, e) => sum + e.protein, 0);
        const totalCarbs = meal.entries.reduce((sum, e) => sum + e.carbs, 0);
        const totalFat = meal.entries.reduce((sum, e) => sum + e.fat, 0);
        
        await prisma.meal.update({
          where: { id: meal.id },
          data: {
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat
          }
        });
        
        console.log('✅ Test öğünü oluşturuldu:', meal.mealType);
        console.log('   - Toplam kalori:', Math.round(totalCalories), 'kcal');
        console.log('   - Yemek sayısı:', meal.entries.length);
      }
    } else {
      console.log('ℹ️  Bugün için öğün zaten var');
    }
    
    // Final durum
    console.log('\n📊 Sistem Durumu:');
    const foodCount = await prisma.food.count();
    const goalCount = await prisma.calorieGoal.count();
    const mealCount = await prisma.meal.count();
    
    console.log('  - Yemek veritabanı:', foodCount, 'yemek');
    console.log('  - Kalori hedefleri:', goalCount, 'kullanıcı');
    console.log('  - Toplam öğün:', mealCount, 'öğün');
    
    console.log('\n✅ Kalori takip sistemi çalışıyor!');
    console.log('🌐 Test için: http://31.97.34.163:3000/calories');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalorieSystem();
