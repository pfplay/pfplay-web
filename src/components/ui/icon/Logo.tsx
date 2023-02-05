import Image from 'next/image'

export const Logo = () => {
  return (
    <button>
      <Image
        src="/icons/wordmark_medium_white.png"
        alt="wordmark"
        width="150px"
        height="36px"
        style={{ marginTop: '1px' }}
      />
    </button>
  )
}
