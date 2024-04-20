import { Typography } from '@/shared/ui/components/typography';

interface ArticleTitleProps {
  title?: string;
}

const ArticleTitle = ({ title }: ArticleTitleProps) => {
  return (
    <Typography type='body1' className='text-white mb-4'>
      {title}
    </Typography>
  );
};

export default ArticleTitle;
