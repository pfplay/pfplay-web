import { PartyroomGrade } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { MenuItem } from '@/shared/ui/components/menu';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import ChatMessage from './parts/chat-message';
import { checkHigherLevel } from '../model/chat-item.model';

export interface ChatItemProps {
  src?: string;
  name: string;
  message: string;
  menuItemList: MenuItem[];
  authority?: PartyroomGrade;
}
const ChatItem = ({ name, message, menuItemList, src, authority }: ChatItemProps) => {
  const isHigherLevel = checkHigherLevel(authority);

  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionStyle='top-[8px] right-[12px]'
    >
      {() => (
        <div className='flex justify-start items-start gap-[13px]'>
          <div className='flexCol justify-start gap-2 px-[5px]'>
            <Profile src={src} size={32} />
            {authority && (
              <Typography
                type='body4'
                className={cn('text-gray-200 text-center', isHigherLevel && 'text-red-400')}
              >
                {authority}
              </Typography>
            )}
          </div>
          <div className='w-full flexCol items-start gap-1'>
            <Typography type='detail2'>{name}</Typography>
            <ChatMessage message={message} />
          </div>
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default ChatItem;
