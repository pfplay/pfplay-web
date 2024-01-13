import React from 'react';
import { cn } from '@/utils/cn';
import { ArticleType } from '.';
import ListItem from './ListItem';

interface ArticleListProps {
  listType: ArticleType['listType'];
  items: ArticleType['items'];
}
const ArticleList = ({ items, listType }: ArticleListProps) => {
  return (
    <ul className={cn(listType)}>
      {items?.map((item) => (
        <ListItem key={crypto.randomUUID()} item={item} />
      ))}
    </ul>
  );
};

export default ArticleList;
