import { ReactElement } from 'react';
import { Dictionary } from '@/shared/lib/localization/i18n.context';
import { UserListItemSuffix, UserListItemSuffixProps } from '@/shared/ui/components/user-list-item';
import { SuffixType } from '@/shared/ui/components/user-list-item/model/user-list-item.model';

type RenderUserListItemParams = {
  me?: boolean;
  djing?: boolean;
  t: Dictionary;
  // ban?: {
  //   value: string;
  //   onButtonClick: (id?: number) => void;
  // };
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
  t,
}: RenderUserListItemParams): UserListItemSuffixResult => {
  // if (ban) {
  //   return {
  //     type: 'button',
  //     Component: (
  //       <UserListItemSuffix type='button' value={ban.value} onButtonClick={ban.onButtonClick} />
  //     ),
  //   };
  // }

  if (djing) {
    return {
      type: 'tag',
      Component: <UserListItemSuffix type='tag' value={t.common.btn.play} />, // FIXME: value djing에 맞게 수정
    };
  }
  if (me) {
    return {
      type: 'tag',
      Component: <UserListItemSuffix type='tag' value={t.common.btn.play} />, // FIXME: value djing에 맞게 수정,
    };
  }

  return undefined;
};