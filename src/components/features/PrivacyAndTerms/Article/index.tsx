import React, { PropsWithChildren } from 'react';
import { ListType, ListItemType } from './ListItem';
import { TableColumnConfig, TableData } from './Table';
import Typography from '../../../shared/atoms/Typography';

export type ArticleListType = {
  type?: 'list';
  listType: ListType;

  items: (ListItemType & CommonArticleType)[];
};
export type ArticleTableType = {
  type?: 'table';
  columnConfig?: TableColumnConfig<any>[];
  tableData?: TableData<any>[];
  items?: (ArticleTableType & CommonArticleType)[];
};
type DefaultArticleType = {
  type?: 'default';
  items?: CommonArticleType[];
};
export type CommonArticleType = {
  title?: string;
  subTitle?: string;
  head?: string | string[];
  tail?: string | string[];
  content?: string | string[];
};

export type ArticleType = CommonArticleType &
  (DefaultArticleType | ArticleListType | ArticleTableType);

interface ArticleProps {
  title: ArticleType['title'];
}

const Article = ({ title, children }: PropsWithChildren<ArticleProps>) => {
  return (
    <article className='flexCol items-start'>
      <Typography type='detail2' className='text-white mb-3'>
        {title}
      </Typography>
      {children}
    </article>
  );
};

export default Article;
