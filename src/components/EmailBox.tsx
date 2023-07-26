'use client';

const EmailBox = () => {
  // TODO: 구글 로그인 연동 후 주석 해제
  // const { data: session } = useSession()

  // if (!session) {
  //   return <></>
  // }

  // const email = session.user.email

  const dummyEmail = 'pfplayer@pfplay.co';
  return (
    <div className='text-sm flex justify-center items-center px-6 rounded-[40px] h-[36px] border-solid border-grey-500 border mr-[24px]'>
      <p className='mb-1'>{dummyEmail}</p>
    </div>
  );
};

export default EmailBox;
