import { forwardRef } from 'react';
import { ChatMessage } from '@/entities/current-partyroom';
import { useOpenCrewProfile } from '@/features/view-crew-profile';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';

type ChatItemProps = {
  message: Extract<ChatMessage.Model, { from: 'user' }>;
};

const ChatItem = forwardRef<HTMLDivElement, ChatItemProps>(({ message }, ref) => {
  const crew = message.crew;
  const t = useI18n();
  const openCrewProfile = useOpenCrewProfile();

  return (
    <div
      ref={ref}
      className='flex items-center justify-start gap-4'
      data-testid='chat-message-item'
    >
      <button
        type='button'
        onClick={() => openCrewProfile(crew.crewId)}
        aria-label={`${crew.nickname} ${t.common.btn.view_profile}`}
        className='relative h-14 w-14 shrink-0'
      >
        <Profile src={crew.avatarIconUri} size={56} />
      </button>

      <div className='flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1'>
        <Typography
          type='body3'
          data-testid='chat-message-nickname'
          className='shrink-0 text-[18px] font-bold leading-[1.45] text-white'
        >
          {crew.nickname}
        </Typography>

        <Typography
          type='body3'
          className='min-w-0 text-[18px] font-normal leading-[1.45] text-gray-200'
          style={{ wordBreak: 'break-word' }}
          data-testid='chat-message-content'
        >
          {message.message.content}
        </Typography>
      </div>
    </div>
  );
});

ChatItem.displayName = 'MobileChatItem';

export default ChatItem;
