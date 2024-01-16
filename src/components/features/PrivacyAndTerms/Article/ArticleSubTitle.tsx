import Typography from '@/components/shared/atoms/Typography';

interface ArticleSubTitleProps {
  subTitle?: string;
}

const ArticleSubTitle = ({ subTitle }: ArticleSubTitleProps) => {
  return (
    <Typography type='detail2' className='mb-3 text-white'>
      {subTitle}
    </Typography>
  );
};

export default ArticleSubTitle;
