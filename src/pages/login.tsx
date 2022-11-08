import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const Login: NextPage = () => {
  return (
    <div>
      <Head>
        <title>DEV-PFPLAY</title>
        <meta name="description" content="Your Space" />
      </Head>

      {/* 백그라운드 적용을 위한 코드 */}
      <div
        className=" bg-black fixed w-screen h-screen"
        style={{
          zIndex: -1,
        }}
      >
        <Image src="/image/Onboard.png" alt="Onboard" layout="fill" objectFit="cover" />
      </div>

      {/* 로그인 화면 코드 */}
      <div className="flex justify-between h-screen text-white">
        <div className="ml-4 mt-5">
          <Link href="/">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 cursor-pointer">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
        </div>
        <div className="flex flex-col text-center my-auto">
          <h1 className="text-4xl font-extrabold mb-10 mt-10 tracking-wide">PFPlay</h1>
          <button className="text-xl border-solid border-2 rounded-full  py-4 w-72 pr-8 font-extrabold flex justify-center border-gray-500 ">
            <img className="w-7 relative right-14" src="./icons/google.png" />
            Google
          </button>
          <p className="font-semibold mt-8">OR</p>
          <span className="flex justify-center">
            <p className="underline underline-offset-8 font-semibold mt-8 cursor-pointer w-36 ">먼저 둘러볼래요</p>
          </span>
        </div>

        <div className="flex flex-col">
          <div className="mr-4 mt-4 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
