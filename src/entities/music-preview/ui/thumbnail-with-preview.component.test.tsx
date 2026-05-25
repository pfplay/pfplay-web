import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ThumbnailWithPreview from './thumbnail-with-preview.component';

// next/image 의 문서화된 동작을 충실히 모사한다.
// - unoptimized=true  → 원본 src 그대로 (브라우저가 CDN 에서 직접 로드)
// - 그 외             → Vercel 이미지 최적화 엔드포인트(/_next/image)로 래핑
// 이로써 "썸네일이 최적화 경로를 거치는가"를 렌더 결과(img src)로 판정할 수 있다.
vi.mock('next/image', () => ({
  __esModule: true,
  // next/image 전용 prop(priority/fill 등)은 DOM 으로 흘려보내지 않도록 걸러낸다.
  default: ({
    src,
    alt,
    unoptimized,
    width,
    quality = 75,
    priority: _p,
    fill: _f,
    ...rest
  }: any) => {
    const resolvedSrc = unoptimized
      ? src
      : `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
    return <img src={resolvedSrc} alt={alt} {...rest} />;
  },
}));

// 프리뷰 스토어가 주입된 실제 prod 렌더 경로를 재현.
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useMusicPreview: () => ({
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      isTrackPlaying: () => false,
    }),
  }),
}));

describe('ThumbnailWithPreview', () => {
  const YOUTUBE_THUMBNAIL = 'https://i.ytimg.com/vi/xtnl8sPd6TM/hqdefault.jpg';

  const renderThumbnail = () =>
    render(
      <ThumbnailWithPreview
        previewTrack={{ id: 'xtnl8sPd6TM' } as never}
        thumbnailSrc={YOUTUBE_THUMBNAIL}
        thumbnailAlt='썸네일'
        width={60}
        height={34}
      />
    );

  it('유튜브 썸네일은 Vercel 이미지 최적화(/_next/image)를 거치지 않고 원본 CDN src 로 렌더된다', () => {
    renderThumbnail();

    const img = screen.getByAltText('썸네일');

    // YouTube 가 이미 제공하는 썸네일이라 재최적화 불필요 + 검색 결과는 매번 수십 장이라
    // 최적화 시 Vercel 쿼터를 폭증시켜 402(Payment Required)를 유발한다.
    expect(img.getAttribute('src')).toBe(YOUTUBE_THUMBNAIL);
    expect(img.getAttribute('src')).not.toContain('_next/image');
  });
});
