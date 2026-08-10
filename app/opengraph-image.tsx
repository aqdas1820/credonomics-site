import { ImageResponse } from 'next/og'

export const alt = 'CredoNomics — Financial Research & Decision Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          color: '#ecf7ff',
          background: 'linear-gradient(135deg, #06192d 0%, #083b52 48%, #245fe7 100%)',
          fontFamily: 'Arial, sans-serif',
          padding: '72px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: 999,
            right: -160,
            top: -210,
            background: 'radial-gradient(circle, rgba(68,215,201,.34), rgba(68,215,201,0))',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src="https://www.credonomics.in/credonomics-mark.png" width="58" height="58" style={{ objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: 2 }}>CREDONOMICS</div>
              <div style={{ fontSize: 15, color: '#9fd9df', marginTop: 3 }}>Financial Research & Decision Tools</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
            <div style={{ fontSize: 62, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2 }}>
              Understand the fine print.
            </div>
            <div style={{ fontSize: 62, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2, color: '#69e0d6' }}>
              Quantify the real value.
            </div>
            <div style={{ fontSize: 22, color: '#b8cbda', marginTop: 24 }}>
              Credit cards · Cashback · Fuel economics · Banking research
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a6bfd2', fontSize: 17 }}>
            <span>credonomics.in</span>
            <span>India-first · Document-led · Transparent assumptions</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
