'use client'

import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react'

export interface LogEntry {
  id: string
  parentId?: string | null
  action: string
  timestamp: Date
  metadata: Record<string, unknown>
}

interface ExecutionHistoryProps {
  logs: LogEntry[]
}

export function ExecutionHistory({ logs }: ExecutionHistoryProps) {
  const threadedLogs = logs
    .filter(log => log.action === 'EXECUTION_START')
    .map(startLog => {
      const endLog = logs.find(l => l.parentId === startLog.id)
      const duration = endLog
        ? new Date(endLog.timestamp).getTime() - new Date(startLog.timestamp).getTime()
        : null

      return {
        id: startLog.id,
        timestamp: startLog.timestamp,
        status: endLog?.action === 'EXECUTION_SUCCESS' ? 'success' : endLog ? 'failed' : 'pending',
        duration,
        metadata: {
          input: startLog.metadata?.input,
          output: endLog?.metadata?.output,
        },
      }
    })

  if (threadedLogs.length === 0) {
    return (
      <div className="py-20 text-center">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-900">No executions yet</p>
        <p className="text-xs text-slate-500 mt-1">Execution logs will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200">
      {threadedLogs.map(exec => (
        <div
          key={exec.id}
          className="px-6 py-4 hover:bg-slate-50 group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {exec.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : exec.status === 'failed' ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            )}
            <div>
              <p className="text-sm font-bold text-slate-900 capitalize">{exec.status} Execution</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(exec.timestamp).toLocaleTimeString()}
                {exec.duration ? ` • ${exec.duration}ms` : ' • In progress'}
              </p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
