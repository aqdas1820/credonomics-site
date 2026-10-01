import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'CredoNomics';
    const subtitle = searchParams.get('subtitle') || 'Investment Intelligence';
    const metric = searchParams.get('metric');
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#111',
            color: '#fff',
            fontFamily: 'sans-serif',
            padding: '80px 100px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: 40, height: 40, backgroundColor: '#0066ff', borderRadius: '50%' }} />
              <span style={{ fontSize: 24, fontWeight: 500, color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase' }}>
                CredoNomics
              </span>
            </div>
            
            <div
              style={{
                fontSize: 84,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginTop: 20,
              }}
            >
              {title}
            </div>
            
            <div
              style={{
                fontSize: 40,
                fontWeight: 400,
                color: '#888',
                marginTop: 10,
              }}
            >
              {subtitle}
            </div>
            
            {metric && (
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 600,
                  marginTop: 60,
                  color: '#fff',
                  backgroundColor: '#222',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  border: '1px solid #333'
                }}
              >
                {metric}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
