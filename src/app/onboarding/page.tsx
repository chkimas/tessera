import { OrganizationList } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-xl w-full p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Setup your Workspace</h1>
        <OrganizationList
          hidePersonal
          afterCreateOrganizationUrl="/dashboard/:id"
          afterSelectOrganizationUrl="/dashboard/:id"
        />
      </div>
    </main>
  )
}
