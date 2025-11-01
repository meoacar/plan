/**
 * Event Reminders Cron Job Test Script
 * 
 * Bu script, event-reminders cron job'unun çalışıp çalışmadığını test eder.
 * 
 * Kullanım:
 * node test-event-reminders.js
 */

const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here';
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testEventReminders() {
  console.log('🧪 Event Reminders Cron Job Test Başlatılıyor...\n');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`🔑 Cron Secret: ${CRON_SECRET.substring(0, 10)}...\n`);

  try {
    const response = await fetch(`${API_URL}/api/cron/event-reminders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Cron Job Başarıyla Çalıştı!\n');
      console.log('📈 Sonuçlar:');
      console.log(`   - İşlenen Etkinlik Sayısı: ${data.eventsProcessed}`);
      console.log(`   - Gönderilen Bildirim Sayısı: ${data.notificationsSent}`);
      console.log(`   - Başarısız Bildirim Sayısı: ${data.failedNotifications || 0}`);
      console.log(`   - Zaman Damgası: ${data.timestamp}`);
      
      if (data.processedEventIds && data.processedEventIds.length > 0) {
        console.log(`\n📋 İşlenen Etkinlik ID'leri:`);
        data.processedEventIds.forEach((id, index) => {
          console.log(`   ${index + 1}. ${id}`);
        });
      }
    } else {
      console.log('\n❌ Cron Job Başarısız Oldu!\n');
      console.log('Hata Detayları:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n💥 Test Sırasında Hata Oluştu:\n');
    console.error(error.message);
    
    if (error.cause) {
      console.error('\nHata Nedeni:');
      console.error(error.cause);
    }
  }
}

// Test'i çalıştır
testEventReminders()
  .then(() => {
    console.log('\n✨ Test tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Beklenmeyen hata:', error);
    process.exit(1);
  });
