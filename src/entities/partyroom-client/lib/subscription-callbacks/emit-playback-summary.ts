import type * as ChatMessage from '@/entities/current-partyroom/model/chat-message.model';
import type { PlaybackSummary } from '@/entities/current-partyroom/model/playback-summary-tracker';

/** 추적기 방출 결과를 채팅 스트림에 구획으로 append (null이면 no-op) */
export function appendSummaryToChat(
  summary: PlaybackSummary | null,
  appendChatMessage: (message: ChatMessage.Model) => void
): void {
  if (!summary) return;
  appendChatMessage({ from: 'playback-summary', ...summary, receivedAt: Date.now() });
}
