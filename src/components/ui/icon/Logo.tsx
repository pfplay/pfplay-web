import Image from 'next/image'

export const Logo = () => {
  return (
    <button>
      <Image
        src="/icons/wordmark_medium_white.png"
        alt="wordmark"
        width={150}
        height={36}
        style={{ marginTop: '1px' }}
      />
    </button>
  )
}
