import {
  DefaultUserListItem,
  UserListItemWithButton,
  UserListItemWithTag,
} from '@/shared/ui/components/user-list-item/user-list-item.component';

export const getSuffixTagProps = ({
  me,
  djing,
  ban,
}: {
  me?: {
    suffixValue: string;
  };
  djing?: boolean;
  ban?: {
    suffixValue: string;
    onButtonClick: (id?: number) => void;
  };
}) => {
  if (ban) {
    return {
      suffixType: 'button',
      suffixValue: ban.suffixValue,
      onButtonClick: ban.onButtonClick,
    } as UserListItemWithButton;
  }

  if (djing) {
    return { suffixType: 'tag', suffixValue: 'DJing' } as UserListItemWithTag;
  }
  if (me) {
    return { suffixType: 'tag', suffixValue: me.suffixValue } as UserListItemWithTag;
  }

  return { suffixType: 'default' } as DefaultUserListItem;
};
