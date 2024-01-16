import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

interface ArticleSubTitleProps {
  subTitle?: string;
  className?: string;
}

const ArticleSubTitle = ({ subTitle, className }: ArticleSubTitleProps) => {
  return (
    <Typography type='detail2' className={cn('mb-1 text-white', className)}>
      {subTitle}
    </Typography>
  );
};

export default ArticleSubTitle;
