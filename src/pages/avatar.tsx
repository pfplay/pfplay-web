import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import AvatarBody from '@/components/avatarBody'
import AvatarFace from '@/components/avatarFace'
import { BackButtonItem } from '@/components/ui/BackButtonItem'

const menuArr = [
  {
    name: 'Body',
    content: <AvatarBody />,
  },
  {
    name: 'Face',
    content: <AvatarFace />,
  },
]

const Avatar: NextPage = () => {
  const [currentTab, setCurrentTab] = useState(1)

  const selectMenuHandler = (index: number) => {
    setCurrentTab(index)
  }

  return (
    <>
      <Head>
        <title>DEV-PFPLAY-TEST</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full" style={{ height: '60px' }} />
      <main
        className="block text-white gap-6 "
        style={{ margin: '0 auto', maxWidth: '1680px', maxHeight: '800px', padding: '46px 60px' }}>
        <BackButtonItem title="뭘 입고 놀아볼까요?" />
        <div className="flex justify-between">
          <span className="mr-5 w-full" style={{ maxWidth: '400px', maxHeight: '620px' }}>
            <div style={{ height: '620px' }} className="bg-gray-500 w-full"></div>
          </span>
          <span className=" h-full w-full" style={{ maxWidth: '1100px' }}>
            <nav className="flex flex-col sm:flex-row">
              {menuArr.map((ele, index) => {
                return (
                  <button
                    key={index}
                    className={
                      currentTab === index
                        ? ' py-2 px-6 block text-xl font-bold hover:text-red-600 action:outline-none border-b-2 border-red-600 text-red-600'
                        : 'text-gray-200 py-2 px-6 block text-xl font-bold hover:text-red-600'
                    }
                    onClick={() => selectMenuHandler(index)}>
                    {ele.name}
                  </button>
                )
              })}
            </nav>
            {menuArr[currentTab].content}
          </span>
        </div>
        <button
          className="flex items-center justify-center float-right mt-5"
          style={{
            width: '280px',
            height: '48px',
            background: 'linear-gradient(97.75deg, #780808 -5.43%, #AE001F 97.56%)',
            borderRadius: '4px',
          }}>
          <p>Lef&apos;s get in</p>
        </button>
      </main>
    </>
  )
}
export default Avatar
