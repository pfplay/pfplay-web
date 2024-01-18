import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

interface ArticleHeadContentsProps {
  heads?: string[];
  className?: string;
}

const ArticleHeadContents = ({ heads, className }: ArticleHeadContentsProps) => {
  return (
    <>
      {heads?.map((head, i) => {
        return (
          <Typography key={i} type='caption2' className={cn('text-gray-300', className)}>
            {head}
          </Typography>
        );
      })}
    </>
  );
};

export default ArticleHeadContents;
