import { cn } from '@/shared/lib/functions/cn';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import { ChatItemProps } from '@/widgets/partyroom-chat-panel/model/chat-messages.model';
import AuthorityHeadset from './authority-headset.component';
import ChatMessage from './chat-message.component';
import { checkHigherGrade } from '../../model/chat-item.model';

const ChatItem = (props: ChatItemProps) => {
  const {
    fromUser: { nickname, src, partyroomGrade },
    message,
    menuItemList,
    type: _,
  } = props;

  const isHigherLevel = checkHigherGrade(partyroomGrade);

  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionStyle='top-[8px] right-[12px]'
    >
      {() => (
        <div className='flex justify-start items-start gap-[13px]'>
          <div className='flexCol items-center gap-2 px-[5px] basis-1/5'>
            <div className='relative'>
              <Profile src={src} size={32} />
              <AuthorityHeadset authority={partyroomGrade} />
            </div>
            {partyroomGrade && (
              <Typography
                type='body4'
                className={cn(
                  galmuriFont.className,
                  'text-gray-200 text-center',
                  isHigherLevel && 'text-red-400'
                )}
              >
                {partyroomGrade}
              </Typography>
            )}
          </div>
          <div className='w-full flexCol items-start gap-1'>
            <Typography type='detail2'>{nickname}</Typography>
            <ChatMessage message={message} />
          </div>
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default ChatItem;