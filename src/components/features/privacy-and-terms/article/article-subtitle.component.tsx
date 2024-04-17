import { cn } from '@/shared/lib/cn';
import Typography from '@/shared/ui/components/typography/typography.component';

interface ArticleSubTitleProps {
  subTitle?: string;
  className?: string;
}

const ArticleSubtitle = ({ subTitle, className }: ArticleSubTitleProps) => {
  return (
    <Typography type='detail2' className={cn('mb-1 text-white', className)}>
      {subTitle}
    </Typography>
  );
};

export default ArticleSubtitle;
