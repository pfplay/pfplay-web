import Typography from '@/shared/ui/components/typography/typography.component';
import ArticleSubtitle from './article-subtitle.component';
import ArticleTitle from './article-title.component';

export interface DefaultArticleProps {
  type?: 'default';
  title: string;
  heads?: string[];
  contents?: {
    subTitle?: string;
    heads?: string[];
  }[];
}

const DefaultArticle = (config: DefaultArticleProps) => {
  return (
    <section>
      {config?.title && <ArticleTitle title={config.title} />}
      <div className='flexCol space-y-2'>
        {config.heads?.map((head, i) => {
          return (
            <Typography key={i} type='caption2' className=' text-gray-300 '>
              {head}
            </Typography>
          );
        })}
      </div>
      {config.contents?.map((content, i) => {
        return (
          <article key={i} className='[&:not(:last-child)]:mb-4'>
            {content?.subTitle && <ArticleSubtitle subTitle={content.subTitle} />}
            {content.heads?.map((head, i) => {
              return (
                <Typography key={i} type='caption2' className='mb-1 text-gray-300'>
                  {head}
                </Typography>
              );
            })}
          </article>
        );
      })}
    </section>
  );
};

export default DefaultArticle;
