'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FC, ReactNode } from 'react';
import { Menu } from '@headlessui/react';
import { useFetchMe } from '@/entities/me';
import { BugReportButton } from '@/features/bug-report';
import { useSignOut } from '@/features/sign-out';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import useIntersectionObserver from '@/shared/lib/hooks/use-intersection-observer.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import LanguageChangeMenu from '@/shared/lib/localization/language-change-menu.component';
import { MenuButton, MenuItemPanel } from '@/shared/ui/components/menu';

interface Props {
  withLogo?: boolean;
}

const Header: FC<Props> = ({ withLogo }) => {
  const t = useI18n();
  const { data: me } = useFetchMe();
  const {
    isIntersecting: atTopOfPage,
    setRef: setTopElRef,
    observed: isTopElObserved,
  } = useIntersectionObserver({
    threshold: 0.1,
  });
  const signOut = useSignOut();

  const idMenuVisible = !!me && me.authorityTier !== AuthorityTier.GT;
  // 동일 ID 메뉴를 viewport 별 위치에 두 곳 렌더 (모바일=좌측, 데스크탑=우측 group 안).
  // Headless UI Menu 는 instance 독립이라 두 곳에 두어도 state 충돌 없음.
  const renderIdMenu = (responsiveClass: string): ReactNode => {
    if (!idMenuVisible) return null;
    return (
      <Menu as='section' className={cn('relative w-fit', responsiveClass)}>
        {({ close }) => (
          <>
            <MenuButton type='button'>
              <span className='block max-w-[160px] truncate'>
                {me.email?.split('@')[0] ?? 'Guest'}
              </span>
            </MenuButton>
            <MenuItemPanel
              menuItemConfig={[
                {
                  label: t.common.btn.logout,
                  onClickItem: signOut,
                },
              ]}
              onMenuClose={close}
              size='sm'
            />
          </>
        )}
      </Menu>
    );
  };

  return (
    <>
      <div ref={setTopElRef} />

      <header
        className={cn(
          'fixed top-0 w-full h-[var(--header-height)] flex items-center justify-between px-app pt-10 pb-6 transition-colors z-20',
          isTopElObserved && !atTopOfPage && 'bg-black'
        )}
      >
        {/* 좌측 group: 데스크탑 로고 + 모바일 ID */}
        <div className='flex items-center'>
          {withLogo && (
            <Link href='/' className='hidden tablet:block'>
              <Image
                src='/images/Logo/wordmark_small_white.png'
                width={124}
                height={30}
                alt='Pfplay Logo'
                priority
              />
            </Link>
          )}
          {renderIdMenu('block tablet:hidden')}
        </div>

        {/* 우측 group: 데스크탑 ID + 국제화 + 버그 (모바일에선 국제화 + 버그만) */}
        <div className='items-center gap-6 flexRow'>
          {renderIdMenu('hidden tablet:flex')}
          <LanguageChangeMenu />
          {me && <BugReportButton />}
        </div>
      </header>
    </>
  );
};

export default Header;
