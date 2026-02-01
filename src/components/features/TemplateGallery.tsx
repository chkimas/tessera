'use client'

import { useState } from 'react'
import { createFromTemplateAction } from '@/actions/template-actions'
import { createCheckoutSessionAction } from '@/actions/billing-actions'
import { Sparkles, Lock } from 'lucide-react'

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
    description: 'Relay critical system events to Slack.',
    icon: '💬',
    isPremium: false,
  },
  {
    id: 'ai-lead-analyzer',
    name: 'AI Lead Researcher',
    description: 'GPT-4 lead summarization.',
    icon: '🧠',
    isPremium: true,
  },
]

export default function TemplateGallery({
  orgId,
  planStatus,
}: {
  orgId: string
  planStatus: string
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const isPro = ['active', 'trialing'].includes(planStatus)

  const handleSelect = async (tpl: Template) => {
    if (tpl.isPremium && !isPro) {
      setLoading(tpl.id)
      await createCheckoutSessionAction(orgId, 'pro')
      return
    }

    setLoading(tpl.id)
    try {
      await createFromTemplateAction(orgId, tpl.id)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Blueprint Library</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => handleSelect(tpl)}
            disabled={!!loading}
            className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-500 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">
              {tpl.icon}
            </span>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-900">{tpl.name}</h3>
              {tpl.isPremium && !isPro && <Lock className="w-3.5 h-3.5 text-slate-400" />}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{tpl.description}</p>

            {loading === tpl.id && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  Processing
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
