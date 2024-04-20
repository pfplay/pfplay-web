import ArticleTable from './article/article-table.component';
import DefaultArticle from './article/default-article.component';
import ListArticle from './article/list-article.component';
import { privacyPolicyConfig } from './privacy-policy-config';

const PrivacyPolicy = () => {
  return (
    <div className='flexCol gap-10 pt-[7px]'>
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
