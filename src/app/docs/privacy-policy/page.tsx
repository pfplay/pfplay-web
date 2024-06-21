import { privacyPolicyConfig } from 'app/docs/privacy-policy/privacy-policy-config';
import ArticleTable from '../_ui/article-table.component';
import DefaultArticle from '../_ui/default-article.component';
import ListArticle from '../_ui/list-article.component';

const PrivacyPolicyPage = () => {
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

export default PrivacyPolicyPage;
