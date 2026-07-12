import { forwardRef } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import type * as ChatMessage from '../model/chat-message.model';

type Props = { message: Extract<ChatMessage.Model, { from: 'playback-summary' }> };

/**
 * 곡 종료 요약 footer형 구획 (스펙 §2-6):
 * 요약 라인이 먼저, 경계선이 블록 아래 — "위쪽 채팅이 이 곡의 챕터"로 읽히게.
 *
 * forwardRef: 구획이 채팅의 마지막 요소일 때(곡 종료 직후가 대부분) 스크롤 매니저의
 * lastItemRef 를 받아 bottom-pin 자동 스크롤에 참여한다. ChatItem 에만 ref 를 붙이면
 * 구획이 마지막일 때 스크롤이 따라오지 않아 fold 아래로 밀려 안 보인다(모바일처럼
 * 채팅 영역이 짧을 때 특히). ChatItem 과 동일한 forwardRef 계약.
 */
const PlaybackSummaryDivider = forwardRef<HTMLDivElement, Props>(({ message }, ref) => {
  const t = useI18n();
  const dj = message.djNickname ?? t.chat.para.playback_summary_dj_fallback;

  return (
    <div ref={ref} className='px-4' data-testid='playback-summary-divider'>
      <Typography type='caption1' className='text-gray-300 text-center'>
        {'🎵 '}
        {message.trackName}
        {' — '}
        {dj}
        {' · 👍 '}
        {message.counts.like}
        {' · 👎 '}
        {message.counts.dislike}
        {' · 🎁 '}
        {message.counts.grab}
        {message.skipped && (
          <span data-testid='playback-summary-skipped'>
            {' ⏭ ' + t.chat.para.playback_summary_skipped}
          </span>
        )}
      </Typography>
      <hr className='mt-2 border-gray-600' />
    </div>
  );
});

PlaybackSummaryDivider.displayName = 'PlaybackSummaryDivider';

export default PlaybackSummaryDivider;
