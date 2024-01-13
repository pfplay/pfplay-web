import { cn } from '@/utils/cn';
import ArticleList from './ArticleList';
import Typography, { typoStyleDict } from '../../../shared/atoms/Typography';

export type ListType = 'list-disc' | 'list-decimal' | 'list-inherit' | 'list-latin';
export type ListItemType = {
  title?: string;
  subTitle?: string;
  content?: string | string[];
  listHead?: string;
  listType?: ListType;
  subItems?: ListItemType[];
};
interface ClauseProps {
  item: ListItemType;
}

const ListItem = ({ item }: ClauseProps) => {
  return (
    <>
      {item?.title && (
        <Typography type='detail2' className='text-white'>
          {item?.listHead}
        </Typography>
      )}
      {item?.subTitle && (
        <Typography type='detail2' className='text-white'>
          {item?.subTitle}
        </Typography>
      )}
      {item?.listHead && (
        <Typography type='caption2' className='text-gray-300 mt-4'>
          {item?.listHead}
        </Typography>
      )}
      <div className={cn('flexCol items-start', !item?.listHead ? 'ml-5' : 'ml-2')}>
        {typeof item.content === 'string' && (
          <li className={cn('text-gray-300', typoStyleDict.caption2)}>
            {item.content}
            {item.subItems && <ArticleList items={item.subItems} listType={item?.listType} />}
          </li>
        )}

        {/* TODO: 수정 필요 */}
        {Array.isArray(item.content) && (
          <div className='flexCol ml-[10px]'>
            {item.content.map((contentItem) => (
              <li key={crypto.randomUUID()} className={cn('text-gray-300', typoStyleDict.caption2)}>
                {contentItem}
              </li>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ListItem;
