import Typography from '@/components/shared/atoms/typography.component';

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
