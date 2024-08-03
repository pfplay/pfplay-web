import { ReactElement } from 'react';
import { UserListItemSuffix, UserListItemSuffixProps } from '@/shared/ui/components/user-list-item';
import { SuffixType } from '@/shared/ui/components/user-list-item/model/user-list-item.model';

type RenderUserListItemParams = {
  me?: {
    value: string;
  };
  djing?: {
    value: string;
  };
  ban?: {
    value: string;
    onButtonClick: (id?: number) => void;
  };
};

type UserListItemSuffixResult =
  | {
      type: SuffixType;
      Component: ReactElement<UserListItemSuffixProps>;
    }
  | undefined;

export const renderUserListItemSuffix = ({
  me,
  djing,
  ban,
}: RenderUserListItemParams): UserListItemSuffixResult => {
  if (ban) {
    return {
      type: 'button',
      Component: (
        <UserListItemSuffix type='button' value={ban.value} onButtonClick={ban.onButtonClick} />
      ),
    };
  }

  if (djing) {
    return {
      type: 'tag',
      Component: <UserListItemSuffix type='tag' value={djing.value} />,
    };
  }
  if (me) {
    return {
      type: 'tag',
      Component: <UserListItemSuffix type='tag' value={me.value} />,
    };
  }

  return undefined;
};
