'use client'

import { X, Terminal, Clock, ShieldIcon } from 'lucide-react'
import { LogEntry } from './ExecutionHistory'

interface ExecutionDetailModalProps {
  log: LogEntry
  onClose: () => void
}

export default function ExecutionDetailModal({ log, onClose }: ExecutionDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Execution Details</h3>
              <p className="text-xs text-slate-500 font-mono">{log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldIcon className="h-3 w-3" /> Action
              </div>
              <p className="text-slate-900 font-semibold">{log.action}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="h-3 w-3" /> Timestamp
              </div>
              <p className="text-slate-900 font-semibold">
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-slate-700">Payload Metadata</h4>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                JSON
              </span>
            </div>
            <pre className="p-4 bg-slate-900 text-indigo-300 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
