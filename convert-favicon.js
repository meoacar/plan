const sharp = require('sharp');
const fs = require('fs');

// PNG'yi ICO'ya çevir
async function convertToIco() {
  try {
    // Önce resmi 32x32'ye resize et
    const buffer = await sharp('favicon-new.png')
      .resize(32, 32)
      .toFormat('png')
      .toBuffer();
    
    // ICO formatı için basit bir wrapper
    // ICO header (6 bytes)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type (1 = ICO)
    header.writeUInt16LE(1, 4); // Number of images
    
    // Image directory entry (16 bytes)
    const dirEntry = Buffer.alloc(16);
    dirEntry.writeUInt8(32, 0);  // Width
    dirEntry.writeUInt8(32, 1);  // Height
    dirEntry.writeUInt8(0, 2);   // Color palette
    dirEntry.writeUInt8(0, 3);   // Reserved
    dirEntry.writeUInt16LE(1, 4); // Color planes
    dirEntry.writeUInt16LE(32, 6); // Bits per pixel
    dirEntry.writeUInt32LE(buffer.length, 8); // Image size
    dirEntry.writeUInt32LE(22, 12); // Image offset
    
    // Combine all parts
    const ico = Buffer.concat([header, dirEntry, buffer]);
    
    // Save as ICO
    fs.writeFileSync('public/favicon.ico', ico);
    fs.writeFileSync('src/app/icon.ico', ico);
    
    console.log('✅ Favicon başarıyla oluşturuldu!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

convertToIco();
