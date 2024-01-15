import React from 'react';
import { termsOfServiceConfig } from '@/constants/privacyAndTerms/termsOfServiceConfig';
import DefaultArticle from './Article/New/DefaultArticle';
import ListArticle from './Article/New/ListArticle';

const TermsOfService = () => {
  return (
    <section className='flexCol gap-10'>
      {termsOfServiceConfig.map((config, i) => {
        if (config.type === 'default') {
          return <DefaultArticle key={i} {...config} />;
        }
        if (config.type === 'list') {
          return <ListArticle key={i} {...config} />;
        }
      })}
    </section>
  );
};

export default TermsOfService;
