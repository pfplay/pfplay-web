import { cn } from '@/shared/lib/functions/cn';
import Typography from '@/shared/ui/components/typography/typography.component';

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
