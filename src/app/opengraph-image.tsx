import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jahongir Murtazaev — Finance, Data & AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#f5f8ff',
          background:
            'radial-gradient(circle at 82% 18%, rgba(118,84,255,.42), transparent 38%), radial-gradient(circle at 12% 86%, rgba(32,199,235,.3), transparent 40%), #080c18',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, letterSpacing: 4, color: '#8eeeff' }}>
          <span>FINANCE · DATA · AI</span>
          <span>JAHONGIRAI.UZ</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 82, fontWeight: 700, lineHeight: 0.9, letterSpacing: -5 }}>
          <span>JAHONGIR</span>
          <span>MURTAZAEV</span>
          <span style={{ color: '#a7b6cf' }}>MUKHTORKHON OGLI</span>
        </div>
        <div style={{ display: 'flex', fontSize: 25, color: '#aebbd1' }}>
          Transforming ideas into intelligent digital solutions.
        </div>
      </div>
    ),
    size,
  );
}
