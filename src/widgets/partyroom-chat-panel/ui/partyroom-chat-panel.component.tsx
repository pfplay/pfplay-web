'use client';
import { Crew, useCurrentPartyroomChat } from '@/entities/current-partyroom';
import { ChatMessage } from '@/entities/current-partyroom';
import { useAdjustGrade } from '@/features/partyroom/adjust-grade';
import { useDeleteChatMessageDialog } from '@/features/partyroom/impose-penalty';
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

// const mockChats = [
//   {
//     crew: {
//       uid: 'a28ae220-c2a7-4d7b-9bc8-51ff3e933aec',
//       authorityTier: 'FM',
//       crewId: 15,
//       gradeType: 'LISTENER',
//       nickname: 'nickname',
//       avatarBodyUri: '',
//       avatarFaceUri: '',
//       avatarIconUri: '',
//       combinePositionX: 0,
//       combinePositionY: 0,
//       motionType: MotionType.NONE,
//     },
//     content: 'hihi',
//     receivedAt: 1727887126419,
//   },
//   {
//     crew: {
//       uid: 'e2915d5f-dc2d-4aa8-88ec-6faa18526f9a',
//       authorityTier: 'FM',
//       crewId: 16,
//       gradeType: 'LISTENER',
//       nickname: 'nickname',
//       avatarBodyUri: '',
//       avatarFaceUri: '',
//       avatarIconUri: '',
//       combinePositionX: 0,
//       combinePositionY: 0,
//       motionType: MotionType.NONE,
//     },
//     content: 'hoho',
//     receivedAt: 1727887132622,
//   },
//   {
//     crew: {
//       uid: 'e2915d5f-dc2d-4aa8-88ec-6faa18526f9a',
//       authorityTier: 'FM',
//       crewId: 16,
//       gradeType: 'LISTENER',
//       nickname: 'nickname',
//       avatarBodyUri: '',
//       avatarFaceUri: '',
//       avatarIconUri: '',
//       combinePositionX: 0,
//       combinePositionY: 0,
//       motionType: MotionType.NONE,
//     },
//     content: 'hoho',
//     receivedAt: 1727887142810,
//   },
// ] as ReturnType<typeof useCurrentPartyroomChat>;

export default function PartyroomChatPanel() {
  const t = useI18n();
  const adjustGrade = useAdjustGrade();
  const openDeleteChatMessageDialog = useDeleteChatMessageDialog();
  const containerRef = useVerticalStretch<HTMLDivElement>();
  const chatMessages = useCurrentPartyroomChat();
  const me = useStores().useCurrentPartyroom((state) => state.me);
  const myPermissions = me && Crew.Permission.of(me.gradeType);
  const { scrollContainerRef, lastItemRef } = useChatMessagesScrollManager<
    HTMLDivElement,
    HTMLDivElement
  >({
    itemsGap: 16,
  });

  console.log({ chatMessages });

  return (
    <div ref={containerRef} className='flexCol gap-1'>
      <div ref={scrollContainerRef} className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4'>
        {chatMessages.map((message, i) => {
          const isLast = i === chatMessages.length - 1;
          const isMe = message.crew.crewId === me?.crewId;

          return (
            <DisplayOptionMenuOnHoverListener
              key={ChatMessage.uniqueId(message)}
              disabled={isMe}
              menuPositionStyle='top-[8px] right-[12px]'
              menuItemPanelSize='sm'
              menuConfig={[
                {
                  label: t.common.btn.authority,
                  onClickItem: () => adjustGrade(message.crew),
                  visible: !!myPermissions?.canAdjustGrade(message.crew.gradeType),
                },
                {
                  label: t.common.btn.delete,
                  onClickItem: () => {
                    // console.log({ crewId: message.crew.memberId });
                    openDeleteChatMessageDialog({
                      // @ts-ignore FIXME: BE에서 받아오는 데이터가 crewId 수정될 때 ts-ignore 지우고 crewId 수정
                      crewId: message.crew.memberId,
                    });
                  },
                  // visible: !!myPermissions?.canAdjustGrade(message.crew.gradeType),
                },
                {
                  label: 'Kick', // TODO: i18n 적용
                  onClickItem: () => {
                    alert('Not implemented yet.');
                  },
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
