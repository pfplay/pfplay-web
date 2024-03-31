import { Href } from '@/components/shared/router/app-link.component';

export const privacyAndTermsTabsConfig = [
  {
    index: 0,
    title: '서비스 이용약관',
    href: '/docs/terms-of-service',
  },
  {
    index: 1,
    title: '개인정보 처리방침',
    href: '/docs/privacy-policy',
  },
] satisfies { index: number; title: string; href: Href }[];
