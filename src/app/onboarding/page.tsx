import { OrganizationList } from '@clerk/nextjs'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Tessera</h1>
          <p className="text-slate-500 mt-2">To begin, please create or join an organization.</p>
        </div>

        <OrganizationList
          hidePersonal
          afterCreateOrganizationUrl="/dashboard/:id"
          afterSelectOrganizationUrl="/dashboard/:id"
        />
      </div>
    </div>
  )
}
