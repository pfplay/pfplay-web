import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import type { ReactNode } from 'react';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;

const API_BASE = process.env.NEXT_PUBLIC_API_HOST_NAME?.replace(/\/+$/, '');

type PartyroomOG = {
  partyroomId: number;
  title: string;
  introduction: string;
  crewCount: number;
  playback: {
    name: string;
    thumbnailImage: string;
  } | null;
};

async function fetchPartyroomByLink(linkDomain: string): Promise<PartyroomOG | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/partyrooms/link/${linkDomain}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const linkDomain = searchParams.get('linkDomain');

  const partyroom = linkDomain ? await fetchPartyroomByLink(linkDomain) : null;

  const logoPath = join(process.cwd(), 'public', 'images', 'Logo', 'wordmark_large_white.png');
  const logoData = await readFile(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  const fontPath = join(process.cwd(), 'public', 'fonts', 'NotoSansKR-Regular.otf');
  const fontData = (await readFile(fontPath)).buffer as ArrayBuffer;

  const hasPlayback = partyroom?.playback != null;

  const element: ReactNode = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0E0E0E',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      {/* 상단: 로고 */}
      <div style={{ display: 'flex', padding: '32px 48px 0' }}>
        <img src={logoBase64} height={28} />
      </div>

      {/* 중앙: 썸네일 (전체 너비) */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: hasPlayback ? '20px 48px' : '20px 48px',
        }}
      >
        {hasPlayback && partyroom?.playback ? (
          <img
            src={partyroom.playback.thumbnailImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '12px',
            }}
          />
        ) : (
          <img src={logoBase64} height={80} style={{ opacity: 0.3 }} />
        )}
      </div>

      {/* 하단: 제목 + 소개 + 참여자 수 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 48px 36px',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {partyroom?.title ?? 'PFPlay Partyroom'}
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#A0A0A0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {partyroom?.introduction ?? 'PFP Playground for music'}
          </div>
        </div>

        {partyroom && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 18,
              color: '#A0A0A0',
            }}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='#A0A0A0'>
              <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
            </svg>
            {partyroom.crewCount}
          </div>
        )}
      </div>
    </div>
  );

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'sans-serif',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new NextResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}
