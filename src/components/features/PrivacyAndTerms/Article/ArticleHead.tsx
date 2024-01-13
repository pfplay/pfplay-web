import { ArticleType } from '.';
import Typography from '../../../shared/atoms/Typography';

interface ArticleHeadProps {
  head: ArticleType['head'];
}

const ArticleHead = ({ head }: ArticleHeadProps) => {
  return (
    <div className='flexCol gap-[6px] space-y-4'>
      {typeof head === 'string' && (
        <Typography type='caption2' className='text-gray-300'>
          {head}
        </Typography>
      )}
      {Array.isArray(head) && (
        <div className='flexCol gap-[6px]'>
          {head.map((content) => (
            <Typography key={content} type='caption2' className='text-gray-300'>
              {content}
            </Typography>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleHead;
