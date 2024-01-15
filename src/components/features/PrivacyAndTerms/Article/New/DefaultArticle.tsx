import React from 'react';
import Typography from '@/components/shared/atoms/Typography';

export type DefaultArticleType = {
  type?: 'default';
  title?: string;
  heads?: string[];
  contents?: {
    subTitle?: string;
    heads?: string[];
  }[];
};

const DefaultArticle = (config: DefaultArticleType) => {
  return (
    <section>
      {config?.title && (
        <Typography type='body1' className='text-white mb-5'>
          {config.title}
        </Typography>
      )}
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
          <article key={i} className='mb-4'>
            {content?.subTitle && (
              <Typography type='detail2' className='mb-3 text-white'>
                {content.subTitle}
              </Typography>
            )}
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
