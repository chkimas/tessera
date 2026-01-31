import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-white px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            TESSERA
          </span>
          <OrganizationSwitcher
            hidePersonal={true}
            afterCreateOrganizationUrl="/dashboard/:id"
            afterSelectOrganizationUrl="/dashboard/:id"
          />
        </div>

        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="flex-1 bg-slate-50/50">{children}</main>
    </div>
  )
}
