import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { orgId, userId } = await auth()

  if (!userId) redirect('/sign-in')

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar orgId={orgId || ''} />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-end px-8 bg-white border-b border-slate-200">
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
