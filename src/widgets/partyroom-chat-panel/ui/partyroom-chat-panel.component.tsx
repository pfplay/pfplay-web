'use client';
import { useCallback, useRef, useState } from 'react';
import { useCurrentPartyroomChat } from '@/entities/current-partyroom';
import useAlert from '@/entities/current-partyroom/lib/alerts/use-alert.hook';
import { renderSystemChatMessage } from '@/entities/current-partyroom/lib/render-system-chat-message';
import { useAdjustGrade, useCanAdjustGrade } from '@/features/partyroom/adjust-grade';
import { useBlockCrew } from '@/features/partyroom/block-crew';
import {
  useRemoveChatMessage,
  useImposePenalty,
  useCanRemoveChatMessage,
  useCanImposePenalty,
} from '@/features/partyroom/impose-penalty';
import { useChatMessagesScrollManager } from '@/features/partyroom/list-chat-messages';
import { useIsBlockedCrew } from '@/features/partyroom/list-my-blocked-crews';
import { SendChatMessage } from '@/features/partyroom/send-chat-message';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { ONE_MINUTE } from '@/shared/config/time';
import { cn } from '@/shared/lib/functions/cn';
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { Input } from '@/shared/ui/components/input';
import { TooltipTrigger } from '@/shared/ui/components/tooltip';
import { Typography } from '@/shared/ui/components/typography';
import { PFSend } from '@/shared/ui/icons';
import ChatItem from './chat-item.component';

export default function PartyroomChatPanel() {
  const t = useI18n();
  const adjustGrade = useAdjustGrade();
  const canAdjustGrade = useCanAdjustGrade();
  const canRemoveChatMessage = useCanRemoveChatMessage();
  const canImposePenalty = useCanImposePenalty();
  const removeChatMessage = useRemoveChatMessage();
  const imposePenalty = useImposePenalty();
  const blockCrew = useBlockCrew();
  const isBlockedCrew = useIsBlockedCrew();
  const containerRef = useVerticalStretch<HTMLDivElement>();
  const chatMessages = useCurrentPartyroomChat();
  const me = useStores().useCurrentPartyroom((state) => state.me);
  const { scrollContainerRef, lastItemRef } = useChatMessagesScrollManager<
    HTMLDivElement,
    HTMLDivElement
  >({
    itemsGap: 16,
  });

  const banned = useTempChatBanTimer();
  const lastRenderableMessageIndex = chatMessages.reduce((lastIndex, message, index) => {
    if (message.from === 'system') {
      return index;
    }

    return isBlockedCrew(message.crew.crewId) ? lastIndex : index;
  }, -1);

  return (
    <div ref={containerRef} className='flexCol gap-1'>
      <div ref={scrollContainerRef} className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4'>
        {chatMessages.map((message, i) => {
          const isLast = i === lastRenderableMessageIndex;

          if (message.from === 'system') {
            return (
              <Typography
                key={'system' + message.receivedAt}
                ref={isLast ? lastItemRef : undefined}
                type='caption1'
                className={cn(
                  'p-2',
                  message.variant === 'presence'
                    ? 'text-gray-500 text-center text-xs'
                    : 'text-red-200 pl-[58px]'
                )}
              >
                {renderSystemChatMessage(message, { crewEntered: t.chat.para.crew_entered })}
              </Typography>
            );
          }

          if (isBlockedCrew(message.crew.crewId)) {
            return null;
          }

          const isMe = message.crew.crewId === me?.crewId;

          const _canImposePenalty = canImposePenalty(message.crew.gradeType);
          const onClickImposePenalty = (penaltyType: PenaltyType) => {
            imposePenalty({
              crewId: message.crew.crewId,
              crewGradeType: message.crew.gradeType,
              nickname: message.crew.nickname,
              penaltyType,
            });
          };

          return (
            <DisplayOptionMenuOnHoverListener
              key={message.message.messageId}
              disabled={isMe}
              menuPositionClassName='top-[8px] right-[12px]'
              menuItemPanelSize='sm'
              menuConfig={[
                {
                  label: t.common.btn.authority,
                  onClickItem: () => adjustGrade(message.crew),
                  visible: canAdjustGrade(message.crew.gradeType),
                },
                {
                  label: t.common.btn.delete,
                  onClickItem: () => {
                    removeChatMessage({
                      crewId: message.crew.crewId,
                      crewGradeType: message.crew.gradeType,
                      detail: message.message.messageId,
                    });
                  },
                  visible: canRemoveChatMessage(message.crew.gradeType),
                },
                {
                  label: t.common.btn.chat_mute,
                  onClickItem: () => onClickImposePenalty(PenaltyType.CHAT_BAN_30_SECONDS),
                  visible: _canImposePenalty,
                },
                {
                  label: t.common.btn.kick,
                  onClickItem: () => onClickImposePenalty(PenaltyType.ONE_TIME_EXPULSION),
                  visible: _canImposePenalty,
                  testId: 'chat-message-menu-kick',
                },
                {
                  label: t.common.btn.ban,
                  onClickItem: () => onClickImposePenalty(PenaltyType.PERMANENT_EXPULSION),
                  visible: _canImposePenalty,
                  testId: 'chat-message-menu-ban',
                },
                {
                  label: t.common.btn.block,
                  onClickItem: () => blockCrew({ crewId: message.crew.crewId }),
                  testId: 'chat-message-menu-block',
                },
              ]}
              menuButtonTestId='chat-message-menu-button'
              containerTestId='chat-message-hover-item'
            >
              <ChatItem message={message} ref={isLast ? lastItemRef : undefined} />
            </DisplayOptionMenuOnHoverListener>
          );
        })}
      </div>

      <SendChatMessage>
        {({ message, setMessage, send, canSend }) => (
          <TooltipTrigger title={banned ? t.chat.para.chat_banned_hint : undefined}>
            <div>
              <Input
                data-testid='chat-message-input'
                size='lg'
                variant='outlined'
                disabled={banned}
                placeholder={t.chat.para.start_chat}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={() => {
                  if (canSend) send();
                }}
                Suffix={
                  <TooltipTrigger
                    title={
                      !canSend ? (banned ? t.chat.para.chat_banned_hint : undefined) : undefined
                    }
                  >
                    <Button
                      data-testid='chat-message-send-button'
                      color='secondary'
                      variant='fill'
                      Icon={<PFSend width={20} height={20} />}
                      size='sm'
                      className='text-gray-50'
                      onClick={send}
                      disabled={!canSend}
                    />
                  </TooltipTrigger>
                }
              />
            </div>
          </TooltipTrigger>
        )}
      </SendChatMessage>
    </div>
  );
}

/**
 * FIXME: 임시로 채팅 금지 타이머 설정. 나중에 쌈뽕하게 수정 필요. 여기서 useAlert 사용하는거 너무 짜침
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
