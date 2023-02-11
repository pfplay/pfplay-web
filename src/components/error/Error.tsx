const Error = () => {
  return (
    <div className="w-full mt-[60px] lg:mt-[132px]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 items-center">
          <div>
            <span className="text-[80px] lg:text-[130px] leading-tight font-extrabold font-mark">
              500
            </span>
          </div>
          <div className="flex flex-col gap-1 font-normal leading-normal text-sm lg:text-lg font-Pretendard text-center">
            <span>서비스 이용이 원활하지 않아요.</span>
            <span>잠시후 다시 이용해주세요.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Error
