'use client';
import Image from 'next/image';
import Link from 'next/link';
import { SignInByGoogleButtonForDev, useSignInByGoogle } from '@/features/sign-in/by-google';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFClose } from '@/shared/ui/icons';

const SignInPage = () => {
  const t = useI18n();
  const signInByGoogle = useSignInByGoogle();

  // TODO: Onchain 빌더톤 끝나면 주석 해제
  // const openLookAroundDialog = () => {
  //   return openDialog<number>((_, onClose) => ({
  //     title: t.onboard.title.moment,
  //     Sub: (
  //       <Typography type='detail1' className='text-gray-300'>
  //         {t.onboard.para.guest_limit}
  //       </Typography>
  //     ),
  //     Body: () => {
  //       return (
  //         <Dialog.ButtonGroup>
  //           <Dialog.Button
  //             color='secondary'
  //             onClick={() => {
  //               onClose?.();
  //               // 비로그인 유저가 로그인 없이 서비스를 이용할 때에는, 메인스테이지(파티룸)로 바로 뛀궈준다.
  //               // FIXME: 게스트 로그인 API 호출
  //               router.push('/parties/[id]', { path: { id: 1 } });
  //             }}
  //             className='flex-none px-[10.5px]'
  //           >
  //             {t.onboard.btn.guest}
  //           </Dialog.Button>
  //           <Dialog.Button onClick={signInGoogle}>{t.auth.btn.connect_google}</Dialog.Button>
  //         </Dialog.ButtonGroup>
  //       );
  //     },
  //   }));
  // };

  return (
    <div className='relative min-h-screen flexRowCenter'>
      <div className='relative w-full max-w-[640px] flexColCenter px-[20px] pt-[62px] pb-[65px] backdrop-blur-xl bg-backdrop-black/50 border border-gray-800'>
        <Link href='/' className='absolute right-6 top-6 tablet:right-10 tablet:top-10'>
          <PFClose />
        </Link>

        <div className='w-[150px] max-w-full h-[36px] mb-[68px]'>
          <Image
            src='/images/Logo/wordmark_medium_white.png'
            alt='logo'
            width={150}
            height={36}
            className='object-contain w-full h-full pointer-events-none select-none'
          />
        </div>

        <SignInByGoogleButtonForDev />

        <Button
          size='xl'
          typo='detail1'
          color='secondary'
          variant='outline'
          Icon={<Image src='/images/ETC/google.png' alt='google' width={32} height={32} />}
          onClick={signInByGoogle}
          className='w-[320px] h-[56px] mb-[40px]'
        >
          {t.auth.btn.connect_google}
        </Button>

        {/*<TextButton onClick={openLookAroundDialog} underline>*/}
        {/*  {t.onboard.btn.take_a_look}*/}
        {/*</TextButton>*/}
      </div>
    </div>
  );
};

export default SignInPage;
