'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { Menu } from '@headlessui/react';
import { useFetchMe } from '@/entities/me';
import { useSignOut } from '@/features/sign-out';
import { AuthorityTier } from '@/shared/api/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import useIntersectionObserver from '@/shared/lib/hooks/use-intersection-observer.hook';
import LanguageChangeMenu from '@/shared/lib/localization/language-change-menu.component';
import { MenuButton, MenuItemPanel } from '@/shared/ui/components/menu';

interface Props {
  withLogo?: boolean;
}

const Header: FC<Props> = ({ withLogo }) => {
  const { data: me } = useFetchMe();
  const { isIntersecting: atTopOfPage, setRef: setTopElRef } = useIntersectionObserver({
    threshold: 0.1,
  });
  const { mutate: signOut } = useSignOut();

  return (
    <>
      <div ref={setTopElRef} />

      <header
        className={cn(
          'fixed top-0 w-full h-[var(--header-height)] flex items-center px-app pt-10 pb-6 transition-colors z-20',
          withLogo ? 'justify-between' : 'justify-end',
          atTopOfPage ? 'bg-transparent' : 'bg-black'
        )}
      >
        {withLogo && (
          <Link href='/'>
            <Image
              src='/images/Logo/wordmark_small_white.png'
              width={124}
              height={30}
              alt='Pfplay Logo'
              priority
            />
          </Link>
        )}
        <div className='items-center gap-6 flexRow'>
          {me && me.authorityTier !== AuthorityTier.GT && (
            <Menu as='section' className={`relative w-fit`}>
              {({ close }) => (
                <>
                  <MenuButton type='button'>{me.email ?? 'Guest'}</MenuButton>
                  <MenuItemPanel
                    menuItemConfig={[
                      {
                        label: '로그아웃',
                        onClickItem: signOut,
                      },
                    ]}
                    close={close}
                    size='sm'
                  />
                </>
              )}
            </Menu>
          )}

          <LanguageChangeMenu />
        </div>
      </header>
    </>
  );
};

export default Header;