'use client'

import { useState } from 'react'
import { createFromTemplateAction } from '@/actions/template-actions'
import { createCheckoutSessionAction } from '@/actions/billing-actions'

interface Template {
  id: string
  name: string
  description: string
  icon: string
  isPremium: boolean
}

const TEMPLATES: Template[] = [
  {
    id: 'slack-notif',
    name: 'Slack Alerts',
    description: 'Relay critical system events to a designated Slack channel.',
    icon: '💬',
    isPremium: false,
  },
  {
    id: 'ai-lead-analyzer',
    name: 'AI Lead Researcher',
    description: 'Scrapes lead data and uses GPT-4 to summarize their background.',
    icon: '🧠',
    isPremium: true,
  },
]

interface TemplateGalleryProps {
  orgId: string
  planStatus: string
}

export default function TemplateGallery({ orgId, planStatus }: TemplateGalleryProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelect = async (templateId: string, isPremium: boolean) => {
    if (isPremium && planStatus !== 'active') {
      alert('This is a Premium Blueprint. Redirecting to upgrade...')
      await createCheckoutSessionAction(orgId, 'pro')
      return
    }

    setLoading(templateId)
    try {
      await createFromTemplateAction(orgId, templateId)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Workflow Blueprints</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => handleSelect(tpl.id, tpl.isPremium)}
            disabled={!!loading}
            className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-500 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
              {tpl.icon}
            </div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-900 mb-1">{tpl.name}</h3>
              {tpl.isPremium && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Pro
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{tpl.description}</p>

            {loading === tpl.id && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center font-bold text-indigo-600 text-xs uppercase tracking-widest">
                Provisioning...
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
