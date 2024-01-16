import Typography from '@/components/shared/atoms/Typography';
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
      {config?.heads && <ArticleHeadContents heads={config.heads} />}

      {config.contents?.map((content, i) => {
        return (
          <article key={i}>
            {content?.subTitle && (
              <ArticleSubTitle subTitle={content.subTitle} className={'first:mt-3'} />
            )}
            {content?.heads && <ArticleHeadContents heads={content.heads} />}

            <ul className={cn('mb-3', content?.listType)}>
              {content.listItems?.map((listItem, i) => {
                return (
                  <li key={i} className={cn('text-gray-300 ml-5')}>
                    {typeof listItem === 'string' && (
                      <Typography type='caption2' className='text-gray-300'>
                        {listItem}
                      </Typography>
                    )}
                    {isInnerListType(listItem) && (
                      <>
                        <Typography type='caption2' className='text-gray-300'>
                          {listItem.outerListItem}
                        </Typography>
                        <ul className={cn('mb-1', listItem?.innerListType)}>
                          {listItem.innerListItems?.map((innerListItem, i) => {
                            return (
                              <li
                                key={i}
                                className={cn(
                                  'text-gray-300',
                                  listItem?.innerListType !== 'list-none' && 'ml-[10px]'
                                )}
                              >
                                <Typography type='caption2' className='text-gray-300'>
                                  {innerListItem}
                                </Typography>
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
