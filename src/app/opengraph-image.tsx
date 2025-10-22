import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Zayıflama Planım - Gerçek Planlar, Gerçek Sonuçlar';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2d7a4a 0%, #4caf50 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '100px',
            marginBottom: '50px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}
        >
          🎯
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '30px',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Zayıflama Planım
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '40px',
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            marginBottom: '60px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          Gerçek Planlar, Gerçek Sonuçlar
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            padding: '30px 60px',
            borderRadius: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              fontSize: '28px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            <span style={{ fontSize: '40px' }}>📝</span>
            <span>Plan Paylaş</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              fontSize: '28px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            <span style={{ fontSize: '40px' }}>🔍</span>
            <span>Keşfet</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              fontSize: '28px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            <span style={{ fontSize: '40px' }}>💪</span>
            <span>Başarıya Ulaş</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
