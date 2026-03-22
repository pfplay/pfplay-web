import { termsOfServiceConfig } from './terms-of-service-config';
import DefaultArticle from '../_ui/default-article.component';
import ListArticle from '../_ui/list-article.component';

const TermsOfServicePage = () => {
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

export default TermsOfServicePage;
