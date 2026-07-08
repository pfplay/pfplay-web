import { forwardRef } from 'react';
import { ChatMessage, Crew } from '@/entities/current-partyroom';
import { GRADE_TYPE_LABEL } from '@/entities/partyroom-client';
import { useOpenCrewProfile } from '@/features/view-crew-profile';
import { GradeType } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import AuthorityHeadset from './authority-headset.component';

type ChatItemProps = {
  message: Extract<ChatMessage.Model, { from: 'user' }>;
};

const ChatItem = forwardRef<HTMLDivElement, ChatItemProps>(({ message }, ref) => {
  const crew = message.crew;
  const openCrewProfile = useOpenCrewProfile();
  const myGradeComparator = Crew.GradeComparator.of(crew.gradeType);
  const showGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.CLUBBER);
  const emphasisGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.MODERATOR);

  return (
    <div
      ref={ref}
      className='flex justify-start items-start gap-[13px]'
      data-testid='chat-message-item'
    >
      <div className='flexCol items-center gap-2 px-[5px] pt-[2px]'>
        <button
          type='button'
          onClick={() => openCrewProfile(crew.crewId)}
          aria-label={`${crew.nickname} 프로필 보기`}
          className='relative'
        >
          <Profile src={crew.avatarIconUri} size={32} />
          <AuthorityHeadset grade={crew.gradeType} />
        </button>

        {showGradeLabel && (
          <Typography
            type='body4'
            className={cn(
              galmuriFont.className,
              'text-center',
              emphasisGradeLabel ? 'text-red-400' : 'text-gray-200'
            )}
          >
            {GRADE_TYPE_LABEL[crew.gradeType]}
          </Typography>
        )}
      </div>

      <div className='flex-1 flexCol items-start gap-1'>
        <Typography type='detail2' data-testid='chat-message-nickname'>
          {crew.nickname}
        </Typography>

        <Typography
          type='caption1'
          className='bg-gray-900 p-2 rounded-sm text-white'
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
