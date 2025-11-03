const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToIco() {
  try {
    // PNG'yi oku ve farklı boyutlarda ICO oluştur
    const sizes = [16, 32, 48];
    
    for (const size of sizes) {
      const buffer = await sharp('F:/plan/favico/favicon-new.png')
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      console.log(`✅ ${size}x${size} oluşturuldu`);
    }
    
    // 32x32 boyutunu favicon olarak kaydet
    await sharp('F:/plan/favico/favicon-new.png')
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile('public/favicon.ico');
    
    await sharp('F:/plan/favico/favicon-new.png')
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile('src/app/icon.ico');
    
    console.log('✅ Favicon başarıyla oluşturuldu!');
    console.log('📁 public/favicon.ico');
    console.log('📁 src/app/icon.ico');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

convertToIco();
