import React from 'react';

import ListItem from '@/components/shared/ListItem';
import Typography from '@/components/shared/atoms/Typography';
import { privacyPolicyConfig } from '@/constants/privacyAndTerms/privacyPolicyConfig';
import { cn } from '@/utils/cn';

const PrivacyPolicy = () => {
  return (
    <section className='flexCol gap-10'>
      {privacyPolicyConfig.map(({ title, content, listType, items }) => (
        <article key={title} className='flexCol items-start'>
          <Typography type='detail2' className='text-white mb-3'>
            {title}
          </Typography>
          {typeof content === 'string' && (
            <Typography type='caption2' className='text-gray-300'>
              {content}
            </Typography>
          )}
          {Array.isArray(content) && (
            <div className='flexCol gap-[6px]'>
              {content.map((contentItem) => (
                <Typography key={contentItem} type='caption2' className='text-gray-300'>
                  {contentItem}
                </Typography>
              ))}
            </div>
          )}
          {items && (
            <ul className={cn(listType)}>
              {items.map((item) => (
                <ListItem key={crypto.randomUUID()} item={item} />
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
};

export default PrivacyPolicy;
