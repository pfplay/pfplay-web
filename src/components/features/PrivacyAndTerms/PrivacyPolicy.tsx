import React from 'react';
import { privacyPolicyConfig } from '@/constants/privacyAndTerms/privacyPolicyConfig';
import DefaultArticle from './Article/New/DefaultArticle';
import ListArticle from './Article/New/ListArticle';
import ArticleTable from './Article/New/TableArticle';

const PrivacyPolicy = () => {
  return (
    <div className='flexCol gap-10'>
      {privacyPolicyConfig.map((config, i) => {
        if (config.type === 'default') {
          return <DefaultArticle key={i} {...config} />;
        }
        if (config.type === 'list') {
          return <ListArticle key={i} {...config} />;
        }
        if (config.type === 'table') {
          return <ArticleTable key={i} {...config} />;
        }
      })}
    </div>
  );
};

export default PrivacyPolicy;
