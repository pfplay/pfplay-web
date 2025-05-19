import { forwardRef, useMemo } from 'react';
import { ChatMessage, Crew } from '@/entities/current-partyroom';
import { GRADE_TYPE_LABEL } from '@/entities/partyroom-client';
import { ViewCrewProfile } from '@/features/view-crew-profile';
import { GradeType } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import AuthorityHeadset from './authority-headset.component';

type ChatItemProps = {
  message: Extract<ChatMessage.Model, { from: 'user' }>;
};

const ChatItem = forwardRef<HTMLDivElement, ChatItemProps>(({ message }, ref) => {
  const crew = message.crew;
  const me = useStores().useCurrentPartyroom((state) => state.me);

  const myGradeComparator = Crew.GradeComparator.of(crew.gradeType);
  const showGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.CLUBBER);
  const emphasisGradeLabel = myGradeComparator.isHigherThanOrEqualTo(GradeType.MODERATOR);

  const { openDialog } = useDialog();
  const isMe = useMemo(() => crew.crewId === me?.crewId, [crew.crewId, me?.crewId]);

  const handleClickCrewProfileButton = () => {
    if (isMe) {
      return;
    }

    return openDialog((_) => ({
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={cn(defaultClassName, 'h-[31px]')}></Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'w-[620px] h-[391px] py-7 px-10 bg-black',
      },
      Body: <ViewCrewProfile crewId={crew.crewId} />,
    }));
  };
  // TODO: 1. 프로필 버튼 클릭 시 프로필 수정 모달 띄우기. (나 일떄도 가능?)

  return (
    <div ref={ref} className='flex justify-start items-start gap-[13px]'>
      <div className='flexCol items-center gap-2 px-[5px] pt-[2px]'>
        <div
          className={cn('relative cursor-pointer z-10', isMe && 'cursor-default')}
          onClick={handleClickCrewProfileButton}
        >
          <Profile src={crew.avatarIconUri} size={32} />
          <AuthorityHeadset grade={crew.gradeType} />
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
            {GRADE_TYPE_LABEL[crew.gradeType]}
          </Typography>
        )}
      </div>

      <div className='flex-1 flexCol items-start gap-1'>
        <Typography type='detail2'>{crew.nickname}</Typography>

        <Typography
          type='caption1'
          className='bg-gray-900 p-2 rounded-sm text-white'
          style={{ wordBreak: 'break-word' }}
        >
          {message.message.content}
        </Typography>
      </div>
    </div>
  );
});

export default ChatItem;
