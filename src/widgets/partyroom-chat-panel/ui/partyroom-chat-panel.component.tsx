'use client';
import { useCallback, useRef, useState } from 'react';
import { useCurrentPartyroomChat } from '@/entities/current-partyroom';
import useAlert from '@/entities/current-partyroom/lib/alerts/use-alert.hook';
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
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { Input } from '@/shared/ui/components/input';
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

  return (
    <div ref={containerRef} className='flexCol gap-1'>
      <div ref={scrollContainerRef} className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4'>
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

          if (isBlockedCrew(message.crew.crewId)) {
            return null;
          }

          const isLast = i === chatMessages.length - 1;
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
                  label: 'GGUL', // TODO: i18n 적용
                  onClickItem: () => onClickImposePenalty(PenaltyType.CHAT_BAN_30_SECONDS),
                  visible: _canImposePenalty,
                },
                {
                  label: 'Kick', // TODO: i18n 적용
                  onClickItem: () => onClickImposePenalty(PenaltyType.ONE_TIME_EXPULSION),
                  visible: _canImposePenalty,
                },
                {
                  label: 'Ban', // TODO: i18n 적용
                  onClickItem: () => onClickImposePenalty(PenaltyType.PERMANENT_EXPULSION),
                  visible: _canImposePenalty,
                },
                {
                  label: 'Block', // TODO: i18n 적용
                  onClickItem: () => blockCrew({ crewId: message.crew.crewId }),
                },
              ]}
            >
              <ChatItem message={message} ref={isLast ? lastItemRef : undefined} />
            </DisplayOptionMenuOnHoverListener>
          );
        })}
      </div>

      <SendChatMessage>
        {({ message, setMessage, send, canSend }) => (
          <Input
            size='lg'
            variant='outlined'
            disabled={banned}
            // placeholder='What would you like to talk about?' // TODO: i18n 적용
            placeholder={
              banned
                ? 'You are temporarily banned from chatting.'
                : 'What would you like to talk about?'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={() => {
              if (canSend) send();
            }}
            Suffix={
              <Button
                color='secondary'
                variant='fill'
                Icon={<PFSend width={20} height={20} />}
                size='sm'
                className='text-gray-50'
                onClick={send}
                disabled={!canSend}
              />
            }
          />
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
