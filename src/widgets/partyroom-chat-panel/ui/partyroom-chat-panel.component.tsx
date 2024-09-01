'use client';
import { Member, useCurrentPartyroomChat } from '@/entities/current-partyroom';
import { ChatMessage } from '@/entities/current-partyroom';
import { useAdjustGrade } from '@/features/partyroom/adjust-grade';
import { useChatMessagesScrollManager } from '@/features/partyroom/list-chat-messages';
import { SendChatMessage } from '@/features/partyroom/send-chat-message';
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { Input } from '@/shared/ui/components/input';
import { PFSend } from '@/shared/ui/icons';
import ChatItem from './chat-item.component';

export default function PartyroomChatPanel() {
  const t = useI18n();
  const adjustGrade = useAdjustGrade();
  const containerRef = useVerticalStretch<HTMLDivElement>();
  const chatMessages = useCurrentPartyroomChat();
  const me = useStores().useCurrentPartyroom((state) => state.me);
  const myPermissions = me && Member.Permissions.of(me.gradeType);
  const { scrollContainerRef, lastItemRef } = useChatMessagesScrollManager<
    HTMLDivElement,
    HTMLDivElement
  >({
    itemsGap: 16,
  });

  return (
    <div ref={containerRef} className='flexCol gap-1'>
      <div ref={scrollContainerRef} className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4'>
        {chatMessages.map((message, i) => {
          const isLast = i === chatMessages.length - 1;
          const isMe = message.member.memberId === me?.memberId;

          return (
            <DisplayOptionMenuOnHoverListener
              key={ChatMessage.uniqueId(message)}
              disabled={isMe}
              menuPositionStyle='top-[8px] right-[12px]'
              menuConfig={[
                {
                  label: t.common.btn.authority,
                  onClickItem: () => adjustGrade(message.member),
                  visible: !!myPermissions?.canAdjustGrade(message.member.gradeType),
                },
                {
                  label: t.common.btn.block,
                  onClickItem: () => {
                    alert('Not implemented yet.');
                  },
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
            placeholder='What would you like to talk about?' // TODO: i18n 적용
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
