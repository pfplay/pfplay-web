export default function Home() {
  // const { data: session } = useSession()

  return (
    <>
      <div className="flex justify-center items-center text-white h-full">
        <div className="flex flex-col text-center my-auto pr-14">
          {/* <Image
            className="mb-[72px]"
            src="/logos/wordmark_medium_white.svg"
            width={297.24}
            height={72}
            alt="logo"
          /> */}
          <button>
            {/* <Link href={!session ? './login' : './profile/edit'}>
                <p className="text-xl font-extrabold border-none border-2 rounded-full bg-red-800 text-white py-4 px-16">
                  Let your PFP Play
                </p>
              </Link> */}
          </button>
        </div>
        <div className="w-full absolute bottom-[68px] flex justify-between text-white px-[120px]">
          <p className="font-semibold underline underline-offset-4 text-sm cursor-pointer">
            Privacy&Terms
          </p>
          <p className="font-semibold underline underline-offset-4 text-sm cursor-pointer">
            당신의 PFP는 안녕하신가요?
          </p>
        </div>
      </div>
    </>
  )
}
