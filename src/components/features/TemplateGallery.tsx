'use client'

import { useState } from 'react'
import { createFromTemplateAction } from '@/actions/template-actions'
import { createCheckoutSessionAction } from '@/actions/billing-actions'
import { Lock, Loader2, ArrowRight, Crown } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  icon: string
  isPremium: boolean
  category: string
}

const TEMPLATES: Template[] = [
  {
    id: 'webhook-relay',
    name: 'Universal Event Relay',
    description: 'Route incoming webhooks to Slack, Discord, or Email with clean formatting',
    icon: '🔔',
    isPremium: false,
    category: 'Utilities',
  },
  {
    id: 'github-sync',
    name: 'Issue Tracker Sync',
    description: 'Automatically sync GitHub issues to Notion database for roadmap tracking',
    icon: '🔗',
    isPremium: false,
    category: 'Productivity',
  },
  {
    id: 'ai-lead-intel',
    name: 'AI Lead Researcher',
    description: 'AI-powered lead research and personalized email drafting from LinkedIn profiles',
    icon: '🧠',
    isPremium: true,
    category: 'Sales Intelligence',
  },
  {
    id: 'social-ghostwriter',
    name: 'Social Media Ghostwriter',
    description: 'Repurpose RSS and YouTube content into Twitter threads and LinkedIn posts',
    icon: '✍️',
    isPremium: true,
    category: 'Marketing',
  },
  {
    id: 'revenue-guard',
    name: 'Stripe Revenue Guard',
    description: 'Monitor failed payments and trigger recovery workflows for high-value accounts',
    icon: '💰',
    isPremium: true,
    category: 'Finance',
  },
  {
    id: 'devops-remedy',
    name: 'DevOps Auto-Remedy',
    description: 'Detect 5xx errors, clear caches, restart services, and report resolution status',
    icon: '⚡',
    isPremium: true,
    category: 'Infrastructure',
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
  const isPro = ['active', 'trialing', 'enterprise'].includes(planStatus)

  const handleSelect = async (tpl: Template) => {
    if (tpl.isPremium && !isPro) {
      setLoading(tpl.id)
      await createCheckoutSessionAction(orgId, 'pro')
      return
    }

    setLoading(tpl.id)
    try {
      await createFromTemplateAction(orgId, tpl.id)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATES.map(tpl => {
        const canUse = !tpl.isPremium || isPro

        return (
          <button
            key={tpl.id}
            onClick={() => handleSelect(tpl)}
            disabled={!!loading}
            className="relative bg-white border border-slate-200 overflow-hidden text-left hover:border-indigo-300 hover:shadow-md transition-all disabled:opacity-50 group rounded"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-3xl shrink-0">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-indigo-600 mb-1 block">
                      {tpl.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 truncate" title={tpl.name}>
                      {tpl.name}
                    </h3>
                  </div>
                </div>
                {tpl.isPremium && (
                  <div className="shrink-0 ml-2">
                    {isPro ? (
                      <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Pro
                      </div>
                    ) : (
                      <div className="p-1.5 bg-amber-50 border border-amber-200 rounded">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                {tpl.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500">
                  {canUse ? 'Click to deploy' : 'Requires Pro plan'}
                </span>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                    canUse
                      ? 'bg-indigo-600 text-white group-hover:bg-indigo-700'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {loading === tpl.id && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                <span className="text-xs font-medium text-slate-600">
                  {tpl.isPremium && !isPro ? 'Redirecting...' : 'Deploying...'}
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
