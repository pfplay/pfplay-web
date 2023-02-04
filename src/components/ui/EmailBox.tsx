import { useSession } from 'next-auth/react'

export const EmailBox = () => {
  const { data: session } = useSession()

  if (!session) {
    return <></>
  }

  const email = session.user.email
  return (
    <div className="text-sm flex justify-center items-center px-6 rounded-[40px] h-[36px] border-solid border-[#545454] border">
      <p className="mb-1">{email}</p>
    </div>
  )
}
