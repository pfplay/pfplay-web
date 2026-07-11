'use client';
import { useCallback, useRef, useState } from 'react';
import { PlaybackSummaryDivider, useCurrentPartyroomChat } from '@/entities/current-partyroom';
import useAlert from '@/entities/current-partyroom/lib/alerts/use-alert.hook';
import { useChatMessagesScrollManager } from '@/features/partyroom/list-chat-messages';
import { useIsBlockedCrew } from '@/features/partyroom/list-my-blocked-crews';
import { SendChatMessage, ChatEmojiPicker } from '@/features/partyroom/send-chat-message';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { ONE_MINUTE } from '@/shared/config/time';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import { PFSend } from '@/shared/ui/icons';
import ChatItem from './ui/parts/chat-item.component';

/**
 * 모바일 채팅 패널 (§4.2 채팅 탭 콘텐츠):
 * - 메시지 리스트 (overflow-y-auto, scroll manager bottom-pin)
 * - system 메시지 = 빨간 텍스트 (데스크탑 동일 톤)
 * - 블록된 crew 메시지 숨김 (데스크탑에서 블록한 정책 유지)
 * - 송신 input (하단 sticky, ban 시 disabled)
 * - 모더레이션·호버 메뉴 OUT (§스코프)
 *
 * 본 panel 은 부모 (탭 컨테이너) 가 flexCol h-full 안에 mount 한다는 전제.
 * 부모가 높이/스크롤 가시성을 보장하므로 데스크탑의 `useVerticalStretch` 는 불요.
 */
export default function MobilePartyroomChatPanel() {
  const t = useI18n();
  const chatMessages = useCurrentPartyroomChat();
  const isBlockedCrew = useIsBlockedCrew();
  const { scrollContainerRef, lastItemRef } = useChatMessagesScrollManager<
    HTMLDivElement,
    HTMLDivElement
  >({
    itemsGap: 16,
  });
  const banned = useTempChatBanTimer();
  const chatInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className='flexCol h-full'>
      <div
        ref={scrollContainerRef}
        className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4 px-5'
      >
        {chatMessages.map((message, i) => {
          if (message.from === 'system') {
            return (
              <Typography
                key={'system' + message.receivedAt}
                type='caption1'
                className='text-red-200 p-2 pl-[58px]'
              >
                {message.content}
              </Typography>
            );
          }
          if (message.from === 'playback-summary') {
            return (
              <PlaybackSummaryDivider
                key={'playback-summary' + message.receivedAt}
                message={message}
              />
            );
          }
          if (isBlockedCrew(message.crew.crewId)) {
            return null;
          }
          const isLast = i === chatMessages.length - 1;
          return (
            <ChatItem
              key={message.message.messageId}
              message={message}
              ref={isLast ? lastItemRef : undefined}
            />
          );
        })}
      </div>

      <div className='shrink-0 px-5 pb-3 pt-2 bg-black border-t border-gray-900'>
        <SendChatMessage>
          {({ message, setMessage, send, canSend }) => (
            <Input
              ref={chatInputRef}
              data-testid='chat-message-input'
              size='lg'
              variant='outlined'
              disabled={banned}
              placeholder={t.chat.para.start_chat}
              aria-label={banned ? t.chat.para.chat_banned_hint : t.chat.para.start_chat}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={() => {
                if (canSend) send();
              }}
              Suffix={
                <div className='flex items-center gap-[4px]'>
                  <ChatEmojiPicker
                    disabled={banned}
                    onSelect={(emoji) => setMessage(message + emoji)}
                    // Headless UI가 닫힘 시 트리거로 포커스를 되돌리는 것과의 순서 레이스 예방 — 한 프레임 늦게 입력창으로
                    onClosed={() => requestAnimationFrame(() => chatInputRef.current?.focus())}
                  />
                  <Button
                    data-testid='chat-message-send-button'
                    color='secondary'
                    variant='fill'
                    Icon={<PFSend width={20} height={20} />}
                    size='sm'
                    className='text-gray-50'
                    onClick={send}
                    disabled={!canSend || banned}
                  />
                </div>
              }
            />
          )}
        </SendChatMessage>
      </div>
    </div>
  );
}

/**
 * FIXME: 데스크탑 chat-panel 의 동일 hook 본문 1:1 사본 (의도) — 데스크탑 FIXME 주석 그대로
 * 옮겨옴. 본격 리팩토링은 후속 chunk 가 아닌 별도 작업으로 (데스크탑·모바일 동시 정리).
 */
function useTempChatBanTimer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [banned, setBanned] = useState(false);

  useAlert(
    useCallback((alert) => {
      if (alert.type === PenaltyType.CHAT_BAN_30_SECONDS) {
        setBanned(true);
        timerRef.current = setTimeout(() => {
          setBanned(false);
        }, 30 * ONE_MINUTE);
      }
    }, [])
  );

  return banned;
}
