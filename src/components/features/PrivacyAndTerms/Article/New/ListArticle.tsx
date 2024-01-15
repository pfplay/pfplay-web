import React from 'react';
import Typography, { typoStyleDict } from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

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

export type ListArticleType = {
  type?: 'list';
  title?: string;
  subTitle?: string;
  heads?: string[];
  contents?: ListContentsType[]; // type과 함께 List Type으로 빼기
  tail?: string[];
};

const ListArticle = (config: ListArticleType) => {
  return (
    <article className='flexCol items-start'>
      {config?.title && (
        <Typography type='body1' className='text-white mb-5'>
          {config.title}
        </Typography>
      )}
      {config.heads?.map((head, i) => {
        return (
          <Typography key={i} type='caption2' className='text-gray-300'>
            {head}
          </Typography>
        );
      })}
      {config.contents?.map((content, i) => {
        return (
          <div key={i}>
            {content?.subTitle && (
              <Typography type='detail2' className='mb-3 text-white'>
                {content.subTitle}
              </Typography>
            )}
            {content.heads?.map((head, i) => {
              return (
                <Typography key={i} type='caption2' className='mb-1 text-gray-300'>
                  {head}
                </Typography>
              );
            })}
            <ul className={cn('mb-2', content?.listType)}>
              {content.listItems?.map((listItem, i) => {
                return (
                  <li className={cn('text-gray-300 ml-4', typoStyleDict.caption2)}>
                    {typeof listItem === 'string' && (
                      <Typography key={i} type='caption2' className='text-gray-300'>
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
          </div>
        );
      })}
    </article>
  );
};

export default ListArticle;

export const isInnerListType = (listItem: string | InnerListType): listItem is InnerListType => {
  return typeof listItem === 'object';
};
