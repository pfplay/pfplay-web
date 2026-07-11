import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import type * as ChatMessage from '../model/chat-message.model';

type Props = { message: Extract<ChatMessage.Model, { from: 'playback-summary' }> };

/**
 * 곡 종료 요약 footer형 구획 (스펙 §2-6):
 * 요약 라인이 먼저, 경계선이 블록 아래 — "위쪽 채팅이 이 곡의 챕터"로 읽히게.
 */
export default function PlaybackSummaryDivider({ message }: Props) {
  const t = useI18n();
  const dj = message.djNickname ?? t.chat.para.playback_summary_dj_fallback;

  return (
    <div className='px-4' data-testid='playback-summary-divider'>
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
}
