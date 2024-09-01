import { forwardRef } from 'react';
import { ChatMessage, Member } from '@/entities/current-partyroom';
import { GradeType } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import AuthorityHeadset from './authority-headset.component';

type ChatItemProps = {
  message: ChatMessage.Model;
};

const ChatItem = forwardRef<HTMLDivElement, ChatItemProps>(({ message }, ref) => {
  const member = message.member;
  const myGradeComparator = Member.GradeComparator.of(member.gradeType);
  const showGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.CLUBBER);
  const emphasisGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.MODERATOR);

  return (
    <div ref={ref} className='flex justify-start items-start gap-[13px]'>
      <div className='flexCol items-center gap-2 px-[5px] pt-[2px]'>
        <div className='relative'>
          <Profile src={member.avatarIconUri} size={32} />
          <AuthorityHeadset grade={member.gradeType} />
        </div>

        {showGradeLabel && (
          <Typography
            type='body4'
            className={cn(
              galmuriFont.className,
              'text-center',
              emphasisGradeLabel ? 'text-red-400' : 'text-gray-200'
            )}
          >
            {GRADE_TYPE_LABEL[member.gradeType]}
          </Typography>
        )}
      </div>

      <div className='flex-1 flexCol items-start gap-1'>
        <Typography type='detail2'>{member.nickname}</Typography>

        <Typography
          type='caption1'
          className='bg-gray-900 p-2 rounded-sm text-white'
          style={{ wordBreak: 'break-word' }}
        >
          {message.content}
        </Typography>
      </div>
    </div>
  );
});

const GRADE_TYPE_LABEL: Record<GradeType, string> = {
  [GradeType.HOST]: 'Admin',
  [GradeType.COMMUNITY_MANAGER]: 'CM',
  [GradeType.MODERATOR]: 'Mod',
  [GradeType.CLUBBER]: 'Clubber',
  [GradeType.LISTENER]: 'Listener',
};

export default ChatItem;
