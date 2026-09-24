'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ChatMessage,
  PlaybackSummaryDivider,
  useCurrentPartyroomChat,
} from '@/entities/current-partyroom';
import useAlert from '@/entities/current-partyroom/lib/alerts/use-alert.hook';
import { useChatMessagesScrollManager } from '@/features/partyroom/list-chat-messages';
import { useIsBlockedCrew } from '@/features/partyroom/list-my-blocked-crews';
import { SendChatMessage } from '@/features/partyroom/send-chat-message';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { ONE_MINUTE } from '@/shared/config/time';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import { PFSend } from '@/shared/ui/icons';
import ChatItem from './ui/parts/chat-item.component';

type Props = {
  overlay?: boolean;
  expanded?: boolean;
  expandedTop?: number;
  onExpandedChange?: (expanded: boolean) => void;
};

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
export default function MobilePartyroomChatPanel({
  overlay = false,
  expanded: expandedProp,
  expandedTop = 0,
  onExpandedChange,
}: Props) {
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
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const expanded = expandedProp ?? uncontrolledExpanded;
  const updateExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (expandedProp === undefined) setUncontrolledExpanded(nextExpanded);
      onExpandedChange?.(nextExpanded);
    },
    [expandedProp, onExpandedChange]
  );
  const compactMessage = useMemo(
    () =>
      [...chatMessages]
        .reverse()
        .find(
          (message) =>
            message.from === 'system' ||
            (message.from === 'user' && !isBlockedCrew(message.crew.crewId))
        ),
    [chatMessages, isBlockedCrew]
  );

  const renderMessage = (message: ChatMessage.Model, index: number) => {
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
          ref={index === chatMessages.length - 1 ? lastItemRef : undefined}
        />
      );
    }
    if (isBlockedCrew(message.crew.crewId)) return null;

    return (
      <ChatItem
        key={message.message.messageId}
        message={message}
        ref={index === chatMessages.length - 1 ? lastItemRef : undefined}
      />
    );
  };

  return (
    <div
      data-testid='mobile-chat-panel'
      data-expanded={expanded}
      style={overlay && expanded ? { top: expandedTop } : undefined}
      className={cn(
        overlay
          ? cn(
              'absolute left-4 right-4 z-30 flex flex-col overflow-hidden transition-[top,bottom] duration-300 ease-in-out',
              expanded
                ? 'bottom-[calc(env(safe-area-inset-bottom)+12px)]'
                : 'top-[calc(100dvh_-_env(safe-area-inset-bottom)_-_284px)] bottom-[calc(env(safe-area-inset-bottom)+140px)]'
            )
          : 'flexCol h-full'
      )}
    >
      <div
        className={cn(
          'flex h-full min-h-0 flex-col border border-gray-700 bg-gray-900',
          expanded ? 'rounded-[6px] px-3 py-3' : 'rounded-[6px] px-3 pb-4 pt-4'
        )}
      >
        <div className='mb-4 flex items-center justify-between'>
          <Typography type='body2' className='font-normal text-gray-200'>
            {t.chat.title.live}
          </Typography>
          {expanded && (
            <button
              type='button'
              data-testid='mobile-chat-close'
              aria-label={`${t.chat.title.live} ${t.common.btn.close}`}
              onClick={() => updateExpanded(false)}
              className='text-[32px] font-light leading-none text-gray-100'
            >
              ×
            </button>
          )}
        </div>
        {expanded ? (
          <div
            ref={scrollContainerRef}
            data-testid='mobile-chat-scroll'
            className='min-h-0 flex-1 overflow-y-auto px-1'
          >
            <div className='flex flex-col gap-4'>{chatMessages.map(renderMessage)}</div>
          </div>
        ) : (
          compactMessage && (
            <div className='mb-3 px-1 py-1'>
              {renderMessage(compactMessage, chatMessages.indexOf(compactMessage))}
            </div>
          )
        )}
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
              onFocus={() => updateExpanded(true)}
              onClick={() => updateExpanded(true)}
              onPressEnter={() => {
                if (canSend) send();
              }}
              Suffix={
                <div className='flex items-center gap-[2px]'>
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
