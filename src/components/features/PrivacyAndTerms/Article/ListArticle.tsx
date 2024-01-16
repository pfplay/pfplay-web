import React from 'react';
import Typography, { typoStyleDict } from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';
import ArticleHeadContents from './ArticleHeadContents';
import ArticleSubTitle from './ArticleSubTitle';
import ArticleTitle from './ArticleTitle';

export type ListType = 'list-none' | 'list-disc' | 'list-decimal' | 'list-inherit' | 'list-latin';
export type InnerListType = {
  innerListType?: ListType;
  listItemHeads?: string[];
  outerListItem?: string;
  innerListItems?: string[];
};
export type ListContentsType = {
  listType?: ListType;
  subTitle?: string;
  heads?: string[];
  listItems?: (string | InnerListType)[];
  listHead?: string[];
  tail?: string[];
};

export interface ListArticleProps {
  type?: 'list';
  title: string;
  subTitle?: string;
  heads?: string[];
  contents?: ListContentsType[];
  tail?: string[];
}

const ListArticle = (config: ListArticleProps) => {
  return (
    <section className='flexCol items-start'>
      {config?.title && <ArticleTitle title={config.title} />}
      <div className='mb-4'>{config?.heads && <ArticleHeadContents heads={config.heads} />}</div>

      {config.contents?.map((content, i) => {
        return (
          <article key={i}>
            {content?.subTitle && <ArticleSubTitle subTitle={content.subTitle} />}
            {content?.heads && <ArticleHeadContents heads={content.heads} className='mb-1' />}

            <ul className={cn(content?.listType)}>
              {content.listItems?.map((listItem, i) => {
                return (
                  <li key={i} className={cn('text-gray-300 ml-4', typoStyleDict.caption2)}>
                    {typeof listItem === 'string' && (
                      <Typography type='caption2' className='text-gray-300'>
                        {listItem}
                      </Typography>
                    )}
                    {isInnerListType(listItem) && (
                      <>
                        {listItem.outerListItem}
                        <ul className={cn('mb-1', listItem?.innerListType)}>
                          {listItem.innerListItems?.map((innerListItem, i) => {
                            return (
                              <li
                                key={i}
                                className={cn(
                                  'text-gray-300',
                                  listItem?.innerListType !== 'list-none' && 'ml-[10px]',
                                  typoStyleDict.caption2
                                )}
                              >
                                {innerListItem}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
    </section>
  );
};

export default ListArticle;

export const isInnerListType = (listItem: string | InnerListType): listItem is InnerListType => {
  return typeof listItem === 'object';
};
