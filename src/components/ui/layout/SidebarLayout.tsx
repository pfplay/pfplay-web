import SideBar from '@/components/ui/SideBar'

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SideBar />
      <main>{children}</main>
    </div>
  )
}

export default SidebarLayout
