import React from 'react';
import { Button } from '../../button';
import { Tag } from '../../tag';

type BaseSuffixProps = {
  value: string;
};

export type TagSuffixProps = BaseSuffixProps & {
  type: 'tag';
};

export type ButtonSuffixProps = BaseSuffixProps & {
  type: 'button';
  onButtonClick: () => void;
};

export type UserListItemSuffixProps = TagSuffixProps | ButtonSuffixProps;

const UserListItemSuffix: React.FC<UserListItemSuffixProps> = ({ type, value, ...props }) => {
  if (type === 'button') {
    const { onButtonClick } = props as ButtonSuffixProps;

    return (
      <Button variant='outline' color='secondary' onClick={() => onButtonClick()} size='sm'>
        {value}
      </Button>
    );
  }

  return <Tag value={value} variant='filled' />;
};

export default UserListItemSuffix;
