const ErrorFallback = ({ error, resetBoundary }: { error?: Error; resetBoundary?: () => void }) => {
  return (
    <>
      <span>{error?.message}</span>
      <button onClick={resetBoundary}>재시도</button>
    </>
  )
}

export default ErrorFallback
