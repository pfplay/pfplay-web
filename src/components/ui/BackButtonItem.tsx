import { ArrowLeft } from '@/components/ui/icon'

export const BackButtonItem = ({ title }: { title: string }) => {
  return (
    <div className="text-2xl flex items-center mb-8 w-full text-white">
      <ArrowLeft />
      <p>{title}</p>
    </div>
  )
}
