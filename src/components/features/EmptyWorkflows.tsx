'use client'

import { Zap, Plus } from 'lucide-react'

export default function EmptyWorkflows() {
  const scrollToTemplates = () => {
    document.getElementById('template-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center">
      <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <Zap className="h-8 w-8 fill-current" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">No active pipelines found</h3>

      <p className="text-slate-500 max-w-sm mb-8">
        Your Control Plane is ready, but you haven&apos;t deployed any workflows yet. Start with a
        pre-built blueprint to get up and running in seconds.
      </p>

      <button
        onClick={scrollToTemplates}
        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Browse Blueprints
      </button>
    </div>
  )
}
