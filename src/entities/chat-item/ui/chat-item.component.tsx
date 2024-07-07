import { PartyroomGrade } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { MenuItem } from '@/shared/ui/components/menu';
import Profile from '@/shared/ui/components/profile/profile.component';
import { TextArea } from '@/shared/ui/components/textarea';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  src?: string;
  name: string;
  message: string;
  menuItemList: MenuItem[];
  authority?: PartyroomGrade;
}
const ChatItem = ({ name, message, menuItemList, src, authority }: Props) => {
  const highLevel =
    authority &&
    (authority === PartyroomGrade.MOD ||
      authority === PartyroomGrade.CM ||
      authority === PartyroomGrade.ADMIN);

  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionStyle='top-[8px] right-[12px]'
      // listenerDisabled={suffixProps.suffixType === 'button'}
    >
      {() => (
        <div className='flex justify-start items-start gap-[13px]'>
          <div className='flexCol justify-start gap-2 px-[5px]'>
            <Profile src={src} size={32} />
            {authority && (
              <Typography type='body4' className={cn('text-gray-200', highLevel && 'text-red-400')}>
                {authority}
              </Typography>
            )}
          </div>
          <div className='flexCol items-start gap-1'>
            <Typography type='detail2'>{name}</Typography>
            <TextArea initialValue={message} disabled />
          </div>
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default ChatItem;
