import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;

const API_BASE = process.env.NEXT_PUBLIC_API_HOST_NAME;

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
    const res = await fetch(`${API_BASE}v1/partyrooms/link/${linkDomain}`, {
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
  const hasPlayback = partyroom?.playback != null;

  const fontRes = await fetch(new URL('/fonts/NotoSansKR-Regular.otf', request.url));
  const fontData = await fontRes.arrayBuffer();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0E0E0E',
          color: 'white',
          padding: '32px 48px 36px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          PFPlay
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            marginTop: 24,
            marginBottom: 24,
            borderRadius: 20,
            overflow: 'hidden',
            background: '#171717',
            border: '1px solid #2A2A2A',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {hasPlayback && partyroom?.playback?.thumbnailImage ? (
            <img
              src={partyroom.playback.thumbnailImage}
              width={1104}
              height={420}
              style={{
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B6B6B',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 700 }}>PFPlay</div>
              <div style={{ fontSize: 24 }}>PFP Playground for music</div>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {partyroom?.title ?? 'PFPlay Partyroom'}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 22,
                color: '#A0A0A0',
              }}
            >
              {partyroom?.introduction ?? 'PFP Playground for music'}
            </div>
          </div>

          {partyroom ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 22,
                color: '#A0A0A0',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: '#F31F2C',
                }}
              />
              {partyroom.crewCount} listeners
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'NotoSansKR',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    }
  );
}
