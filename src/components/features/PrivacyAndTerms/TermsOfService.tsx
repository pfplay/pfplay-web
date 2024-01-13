import React from 'react';
import ListItem from '@/components/shared/ListItem';
import Typography from '@/components/shared/atoms/Typography';
import { termsOfServiceConfig } from '@/constants/privacyAndTerms/termsOfServiceConfig';
import { cn } from '@/utils/cn';

const TermsOfService = () => {
  return (
    <section className='flexCol gap-10'>
      {termsOfServiceConfig.map((config) => (
        <article key={config.title} className='flexCol items-start'>
          <Typography type='detail2' className='text-white mb-3'>
            {config.title}
          </Typography>

          <div className='flexCol gap-[6px] space-y-4'>
            {typeof config.content === 'string' && (
              <Typography type='caption2' className='text-gray-300'>
                {config.content}
              </Typography>
            )}
            {Array.isArray(config.content) &&
              config.content.map((contentItem) => (
                <Typography key={contentItem} type='caption2' className='text-gray-300'>
                  {contentItem}
                </Typography>
              ))}
          </div>
          {config.items && (
            <ul className={cn(config?.listType)}>
              {config.items.map((item) => (
                <ListItem key={crypto.randomUUID()} item={item} />
              ))}
            </ul>
          )}
          {config.tail && (
            <Typography type='caption2' className='mt-4 text-gray-300'>
              {config.tail}
            </Typography>
          )}
        </article>
      ))}
    </section>
  );
};

export default TermsOfService;
