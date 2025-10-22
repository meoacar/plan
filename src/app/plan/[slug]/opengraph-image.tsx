import { ImageResponse } from 'next/og';

export const alt = 'Zayıflama Planı';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Prisma'yı edge runtime dışında kullanmak için
async function getPlanData(slug: string) {
  const { prisma } = await import('@/lib/prisma');
  return prisma.plan.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = await getPlanData(slug);

  if (!plan) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #2d7a4a 0%, #4caf50 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
          }}
        >
          <div style={{ fontSize: 60, color: 'white', fontWeight: 'bold' }}>
            Plan Bulunamadı
          </div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2d7a4a 0%, #4caf50 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'system-ui',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginRight: '20px',
            }}
          >
            🎯
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '32px', color: 'white', fontWeight: 'bold' }}>
              Zayıflama Planım
            </div>
            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)' }}>
              Gerçek Planlar, Gerçek Sonuçlar
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '50px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Title */}
          <div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '30px',
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {plan.title}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    background: '#2d7a4a',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  {plan.startWeight} kg
                </div>
                <div style={{ fontSize: '32px' }}>→</div>
                <div
                  style={{
                    background: '#4caf50',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  {plan.goalWeight} kg
                </div>
              </div>
              <div
                style={{
                  background: '#f5f5f5',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '24px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ⏱️ {plan.durationText}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid #f5f5f5',
              paddingTop: '30px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {plan.user.image && (
                <img
                  src={plan.user.image}
                  alt={plan.user.name || 'User'}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                  }}
                />
              )}
              <div style={{ fontSize: '24px', color: '#666' }}>
                {plan.user.name || 'Anonim'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '30px', fontSize: '22px', color: '#999' }}>
              <div>❤️ {plan._count.likes}</div>
              <div>💬 {plan._count.comments}</div>
              <div>👁️ {plan.views}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
