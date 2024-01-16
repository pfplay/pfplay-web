import { privacyPolicyConfig } from '@/constants/privacyAndTerms/privacyPolicyConfig';
import DefaultArticle from './Article/DefaultArticle';
import ListArticle from './Article/ListArticle';
import ArticleTable from './Article/TableArticle';

const PrivacyPolicy = () => {
  return (
    <div className='flexCol gap-10 pt-[6px]'>
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
