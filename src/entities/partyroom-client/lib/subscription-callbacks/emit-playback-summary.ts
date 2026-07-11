import type * as ChatMessage from '@/entities/current-partyroom/model/chat-message.model';
import type { PlaybackSummary } from '@/entities/current-partyroom/model/playback-summary-tracker';

/** 추적기 방출 결과를 채팅 스트림에 구획으로 append (null이면 no-op) */
export function appendSummaryToChat(
  summary: PlaybackSummary | null,
  appendChatMessage: (message: ChatMessage.Model) => void
): void {
  if (!summary) return;
  // 명시적 필드 매핑 — PlaybackSummary에 미래 필드가 추가돼도 채팅 모델로 조용히 새지 않게
  appendChatMessage({
    from: 'playback-summary',
    trackName: summary.trackName,
    djNickname: summary.djNickname,
    counts: summary.counts,
    skipped: summary.skipped,
    receivedAt: Date.now(),
  });
}
