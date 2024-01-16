import Typography from '@/components/shared/atoms/Typography';

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
