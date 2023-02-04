import Image from 'next/image'

export const Background = () => {
  return (
    <div
      className="bg-black fixed w-screen h-screen"
      style={{
        zIndex: -1,
      }}>
      <Image src="/image/Onboard.png" alt="Onboard" layout="fill" />
    </div>
  )
}
