'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Zap, Search, Filter, Play, Trash2, Loader2, Eye, Plus } from 'lucide-react'
import { StatusBadge } from '@/components/tessera'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { deleteWorkflowAction, testWorkflowAction } from '@/actions/workflow-actions'

interface Workflow {
  id: string
  name: string
  status: string
  updatedAt: Date
  n8nWebhookUrl: string | null
  n8nWorkflowId: string | null
}

export default function WorkflowsList({
  orgId,
  workflows,
}: {
  orgId: string
  workflows: Workflow[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || wf.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = (workflowId: string) => {
    toast('Delete Workflow?', {
      description: 'This will remove the workflow from your dashboard and n8n.',
      action: {
        label: 'Confirm Delete',
        onClick: () => {
          startTransition(async () => {
            try {
              await deleteWorkflowAction(orgId, workflowId)
              toast.success('Workflow deleted')
            } catch {
              toast.error('Failed to delete workflow')
            }
          })
        },
      },
    })
  }

  const handleTest = async (url: string, id: string) => {
    toast.promise(testWorkflowAction(url, id), {
      loading: 'Executing workflow...',
      success: 'Execution triggered',
      error: 'Trigger failed. Check tunnel connection.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search your workflows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="h-11 border-slate-200 hover:bg-slate-50"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2 text-slate-500" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="flex gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          {['all', 'draft', 'deployed', 'paused'].map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'secondary' : 'ghost'}
              size="sm"
              className="capitalize text-xs font-semibold"
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-3">
        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map(wf => (
            <div
              key={wf.id}
              className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 group-hover:bg-indigo-50 rounded-xl transition-colors border border-slate-100 group-hover:border-indigo-100">
                  <Zap className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-950 transition-colors">
                    {wf.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={wf.status} />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
                      •
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(wf.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {wf.status === 'deployed' && wf.n8nWebhookUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold border-slate-200"
                    onClick={() => handleTest(wf.n8nWebhookUrl!, wf.id)}
                  >
                    <Play className="w-3 h-3 mr-1.5 fill-current" />
                    Test
                  </Button>
                )}
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0" asChild>
                  <Link href={`/dashboard/${orgId}/workflows/${wf.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-300 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(wf.id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 mb-6">
              <Zap className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No matches found' : 'No active workflows'}
            </h3>
            <p className="text-sm text-slate-500 max-w-70 mb-8 leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search terms or status filters to find what you are looking for.'
                : 'You haven’t deployed any workflows yet. Start by choosing a template from the gallery.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild className="rounded-full px-6 shadow-lg shadow-indigo-200">
                <Link href={`/dashboard/${orgId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Templates
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
