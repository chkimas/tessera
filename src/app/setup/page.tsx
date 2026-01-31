'use client'

import { useState } from 'react'
import { seedInitialData } from '@/actions/onboarding-actions'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSetup() {
    setLoading(true)
    try {
      const orgId = await seedInitialData()
      router.push(`/dashboard/${orgId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="max-w-md w-full p-10 bg-white border border-slate-200 rounded-4xl shadow-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-indigo-50 rounded-2xl">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Initialize Instance
        </h1>
        <p className="text-slate-500 mb-10 text-sm leading-relaxed">
          Provision a dedicated multi-tenant workspace with an encrypted vault and pre-configured
          execution pipelines.
        </p>
        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:bg-slate-300 shadow-xl shadow-slate-200 active:scale-95"
        >
          {loading ? 'Provisioning Tenant...' : 'Create Enterprise Workspace'}
        </button>
      </div>
    </div>
  )
}
