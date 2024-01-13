import React from 'react';
import Article from '@/components/features/PrivacyAndTerms/Article';
import ArticleHead from '@/components/features/PrivacyAndTerms/Article/ArticleHead';
import Typography from '@/components/shared/atoms/Typography';
import { termsOfServiceConfig } from '@/constants/privacyAndTerms/termsOfServiceConfig';
import ArticleList from './Article/ArticleList';

const TermsOfService = () => {
  return (
    <section className='flexCol gap-10'>
      {termsOfServiceConfig.map((config) => (
        <Article key={config.title} title={config.title}>
          <ArticleHead head={config.head} />
          {config.type === 'list' && (
            <ArticleList items={config.items} listType={config.listType} />
          )}

          {config.tail && (
            <Typography type='caption2' className='mt-4 text-gray-300'>
              {config.tail}
            </Typography>
          )}
        </Article>
      ))}
    </section>
  );
};

export default TermsOfService;
