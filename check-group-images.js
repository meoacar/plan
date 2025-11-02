const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGroupImages() {
  try {
    const groups = await prisma.group.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        status: true,
      }
    });

    console.log('\n=== GRUP RESİMLERİ KONTROLÜ ===\n');
    
    groups.forEach(group => {
      console.log(`Grup: ${group.name}`);
      console.log(`Slug: ${group.slug}`);
      console.log(`ImageUrl: ${group.imageUrl || 'YOK'}`);
      console.log(`Status: ${group.status}`);
      console.log('---');
    });

    console.log(`\nToplam ${groups.length} onaylı grup bulundu.`);
    console.log(`Resmi olan: ${groups.filter(g => g.imageUrl).length}`);
    console.log(`Resmi olmayan: ${groups.filter(g => !g.imageUrl).length}`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGroupImages();
