import { termsOfServiceConfig } from '@/constants/privacy-and-terms/terms-of-service-config';
import DefaultArticle from './article/default-article.component';
import ListArticle from './article/list-article.component';

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
