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

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Execution Logs
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Real-time
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {threadedLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No recent executions detected.
          </div>
        ) : (
          threadedLogs.map(exec => (
            <div key={exec.id} className="p-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {exec.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : exec.status === 'failed' ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {exec.status} Execution
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(exec.timestamp).toLocaleTimeString()} •
                      {exec.duration ? ` ${exec.duration}ms` : ' In progress...'}
                    </p>
                  </div>
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
