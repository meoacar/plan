import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Blog seed başlıyor...');

  // Admin kullanıcısını bul
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('❌ Admin kullanıcısı bulunamadı!');
    return;
  }

  // Kategoriler oluştur
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'beslenme' },
      update: {},
      create: {
        name: 'Beslenme',
        slug: 'beslenme',
        description: 'Sağlıklı beslenme ve diyet ipuçları',
        color: '#10b981',
        order: 1,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'egzersiz' },
      update: {},
      create: {
        name: 'Egzersiz',
        slug: 'egzersiz',
        description: 'Fitness ve egzersiz programları',
        color: '#3b82f6',
        order: 2,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'motivasyon' },
      update: {},
      create: {
        name: 'Motivasyon',
        slug: 'motivasyon',
        description: 'Motivasyon ve zihinsel sağlık',
        color: '#f59e0b',
        order: 3,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'tarifler' },
      update: {},
      create: {
        name: 'Tarifler',
        slug: 'tarifler',
        description: 'Sağlıklı ve lezzetli tarifler',
        color: '#ef4444',
        order: 4,
      },
    }),
  ]);

  console.log(`✅ ${categories.length} kategori oluşturuldu`);

  // Etiketler oluştur
  const tags = await Promise.all([
    prisma.blogTag.upsert({
      where: { slug: 'kilo-verme' },
      update: {},
      create: { name: 'Kilo Verme', slug: 'kilo-verme' },
    }),
    prisma.blogTag.upsert({
      where: { slug: 'saglikli-yasam' },
      update: {},
      create: { name: 'Sağlıklı Yaşam', slug: 'saglikli-yasam' },
    }),
    prisma.blogTag.upsert({
      where: { slug: 'protein' },
      update: {},
      create: { name: 'Protein', slug: 'protein' },
    }),
  ]);

  console.log(`✅ ${tags.length} etiket oluşturuldu`);

  // Blog yazıları oluştur
  const posts = [
    {
      title: 'Sağlıklı Kilo Vermenin 10 Altın Kuralı',
      slug: 'saglikli-kilo-vermenin-10-altin-kurali',
      excerpt:
        'Sağlıklı ve kalıcı kilo vermek için bilmeniz gereken en önemli 10 kural. Bilimsel araştırmalarla desteklenen ipuçları.',
      content: `
        <h2>Giriş</h2>
        <p>Sağlıklı kilo vermek, sadece daha iyi görünmek değil, aynı zamanda daha sağlıklı bir yaşam sürmek demektir. İşte size yardımcı olacak 10 altın kural:</p>
        
        <h3>1. Kalori Açığı Oluşturun</h3>
        <p>Kilo vermek için harcadığınızdan daha az kalori almanız gerekir. Ancak bu açık çok büyük olmamalı, günde 500-750 kalori açık ideal kabul edilir.</p>
        
        <h3>2. Protein Tüketiminizi Artırın</h3>
        <p>Protein, tokluk hissi verir ve kas kaybını önler. Günlük kalori alımınızın %25-30'u protein olmalı.</p>
        
        <h3>3. Bol Su İçin</h3>
        <p>Günde en az 2-3 litre su içmek metabolizmanızı hızlandırır ve tokluk hissi verir.</p>
        
        <h3>4. Düzenli Egzersiz Yapın</h3>
        <p>Haftada en az 3-4 gün, 30-45 dakika egzersiz yapın. Kardiyo ve kuvvet antrenmanını birleştirin.</p>
        
        <h3>5. Yeterli Uyuyun</h3>
        <p>Günde 7-8 saat kaliteli uyku, hormonlarınızı dengeler ve kilo vermeyi kolaylaştırır.</p>
        
        <h3>6. Stres Yönetimi</h3>
        <p>Stres, kortizol hormonunu artırır ve kilo almaya neden olur. Meditasyon ve yoga gibi aktiviteler faydalıdır.</p>
        
        <h3>7. Küçük Porsiyonlar</h3>
        <p>Daha küçük tabaklarda yemek yiyin ve yavaş çiğneyin. Bu, daha az kalori almanızı sağlar.</p>
        
        <h3>8. İşlenmiş Gıdalardan Kaçının</h3>
        <p>Doğal, tam gıdalar tercih edin. İşlenmiş gıdalar yüksek kalori ve düşük besin değeri içerir.</p>
        
        <h3>9. Sabırlı Olun</h3>
        <p>Sağlıklı kilo verme haftada 0.5-1 kg kadardır. Hızlı kilo verme genellikle geri alınır.</p>
        
        <h3>10. Kendinizi Ödüllendirin</h3>
        <p>Hedeflerinize ulaştığınızda kendinizi ödüllendirin, ancak yemekle değil!</p>
        
        <h2>Sonuç</h2>
        <p>Bu kuralları hayatınıza entegre ederek sağlıklı ve kalıcı kilo verebilirsiniz. Unutmayın, bu bir maraton, sprint değil!</p>
      `,
      categoryId: categories[0].id,
      readTime: 5,
    },
    {
      title: 'Evde Yapabileceğiniz 15 Dakikalık HIIT Antrenmanı',
      slug: 'evde-yapabileceginiz-15-dakikalik-hiit-antrenman',
      excerpt:
        'Ekipman gerektirmeyen, evde kolayca yapabileceğiniz yüksek yoğunluklu interval antrenman programı.',
      content: `
        <h2>HIIT Nedir?</h2>
        <p>HIIT (High Intensity Interval Training), yüksek yoğunluklu egzersizleri kısa dinlenme periyotlarıyla birleştiren bir antrenman yöntemidir.</p>
        
        <h3>Isınma (3 dakika)</h3>
        <ul>
          <li>Yerinde yürüyüş - 1 dakika</li>
          <li>Kol çevirme - 1 dakika</li>
          <li>Hafif zıplama - 1 dakika</li>
        </ul>
        
        <h3>Ana Antrenman (10 dakika)</h3>
        <p>Her hareketi 40 saniye yapın, 20 saniye dinlenin:</p>
        <ol>
          <li><strong>Burpees</strong> - Tüm vücudu çalıştırır</li>
          <li><strong>Dağcı (Mountain Climbers)</strong> - Karın ve bacaklar</li>
          <li><strong>Squat Jump</strong> - Bacak ve kalça</li>
          <li><strong>Plank</strong> - Core bölgesi</li>
          <li><strong>High Knees</strong> - Kardiyo</li>
        </ol>
        <p>Bu döngüyü 2 kez tekrarlayın.</p>
        
        <h3>Soğuma (2 dakika)</h3>
        <ul>
          <li>Yavaş yürüyüş</li>
          <li>Germe hareketleri</li>
        </ul>
        
        <h2>Faydaları</h2>
        <ul>
          <li>Kısa sürede maksimum kalori yakar</li>
          <li>Metabolizmayı hızlandırır</li>
          <li>Ekipman gerektirmez</li>
          <li>Her fitness seviyesine uyarlanabilir</li>
        </ul>
      `,
      categoryId: categories[1].id,
      readTime: 4,
    },
    {
      title: 'Motivasyonunuzu Nasıl Yüksek Tutarsınız?',
      slug: 'motivasyonunuzu-nasil-yuksek-tutarsiniz',
      excerpt:
        'Kilo verme yolculuğunuzda motivasyonunuzu kaybetmemek için pratik ipuçları ve psikolojik stratejiler.',
      content: `
        <h2>Motivasyon Neden Önemli?</h2>
        <p>Kilo verme yolculuğu uzun ve zorlu bir süreçtir. Motivasyonunuzu yüksek tutmak, başarınızın anahtarıdır.</p>
        
        <h3>1. Gerçekçi Hedefler Belirleyin</h3>
        <p>Ulaşılabilir, ölçülebilir hedefler koyun. "10 kilo vermek" yerine "bu ay 2 kilo vermek" daha motive edicidir.</p>
        
        <h3>2. İlerlemenizi Takip Edin</h3>
        <p>Fotoğraflar çekin, ölçümler alın, günlük tutun. Geri dönüp baktığınızda ne kadar yol aldığınızı göreceksiniz.</p>
        
        <h3>3. Destek Sistemi Oluşturun</h3>
        <p>Aile, arkadaşlar veya online topluluklar size destek olabilir. Yalnız olmadığınızı hissetmek önemlidir.</p>
        
        <h3>4. Küçük Başarıları Kutlayın</h3>
        <p>Her küçük ilerleme kutlanmayı hak eder. Kendinizi ödüllendirin (yemekle değil!).</p>
        
        <h3>5. Neden'inizi Hatırlayın</h3>
        <p>Neden kilo vermek istediğinizi yazın ve her gün okuyun. Bu, zor anlarda size güç verecektir.</p>
        
        <h3>6. Esnek Olun</h3>
        <p>Mükemmel olmak zorunda değilsiniz. Bir gün kötü giderse, ertesi gün yeniden başlayın.</p>
        
        <h2>Sonuç</h2>
        <p>Motivasyon dalgalanır, bu normaldir. Önemli olan, düştüğünüzde tekrar kalkmaktır.</p>
      `,
      categoryId: categories[2].id,
      readTime: 6,
    },
  ];

  for (const postData of posts) {
    const post = await prisma.blogPost.create({
      data: {
        ...postData,
        authorId: admin.id,
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    // İlk yazıya etiket ekle
    if (postData.slug === 'saglikli-kilo-vermenin-10-altin-kurali') {
      await prisma.blogPostTag.createMany({
        data: [
          { postId: post.id, tagId: tags[0].id },
          { postId: post.id, tagId: tags[1].id },
        ],
      });
    }

    console.log(`✅ Blog yazısı oluşturuldu: ${post.title}`);
  }

  console.log('🎉 Blog seed tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
