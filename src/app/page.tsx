import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tessera | Control Plane',
  description: 'Enterprise Governance for n8n Workflows',
}

export default async function LandingPage() {
  const { userId, orgId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  if (orgId) {
    redirect(`/dashboard/${orgId}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">
          TESSERA<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Your account is authenticated, but you aren&apos;t part of an organization yet.
        </p>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Next Step
          </p>
          <a
            href="/onboarding"
            className="inline-block w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Create or Join Organization
          </a>
        </div>
      </div>
    </main>
  )
}
