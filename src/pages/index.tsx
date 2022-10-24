import type { NextPage } from 'next';
import Image from 'next/image';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>DEV-PFPLAY</title>
        <meta name="description" content="Your Space" />
      </Head>
      <h1 className="text-3xl font-bold">Hello world! 안녕</h1>
      {/* <Image src="/image/main.png" alt="main" layout="fill" /> */}
    </div>
  );
};

export default Home;
