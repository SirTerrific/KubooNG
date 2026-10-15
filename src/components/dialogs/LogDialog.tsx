import React from 'react'
import { LogItem } from '../../types'
import { X, Trash2, Copy, Check, Terminal } from 'lucide-react'

interface LogDialogProps {
  logs: LogItem[]
  onClearLogs: () => void
  onClose: () => void
}

export const LogDialog: React.FC<LogDialogProps> = ({ logs, onClearLogs, onClose }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    const text = logs
      .map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.type}] ${l.message} ${l.details || ''}`)
      .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getTypeBadge = (type: LogItem['type']) => {
    switch (type) {
      case 'ERROR':
        return 'bg-red-900/60 text-red-300 border-red-700'
      case 'WARN':
        return 'bg-amber-900/60 text-amber-300 border-amber-700'
      case 'NETWORK':
        return 'bg-blue-900/60 text-blue-300 border-blue-700'
      case 'READER':
        return 'bg-purple-900/60 text-purple-300 border-purple-700'
      case 'INFO':
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#212121] border border-[#3e3e3e] rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-kuboo-accent" />
            <h3 className="text-base font-bold text-white">Event &amp; Network Logs</h3>
            <span className="text-xs text-kuboo-textMuted">({logs.length})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 text-kuboo-textMuted hover:text-white rounded hover:bg-[#333333] transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClearLogs}
              className="p-1.5 text-kuboo-textMuted hover:text-red-400 rounded hover:bg-[#333333] transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-kuboo-textMuted hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs container */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 font-mono text-xs">
          {logs.length > 0 ? (
            logs.map(log => (
              <div
                key={log.id}
                className="p-2.5 rounded bg-[#181818] border border-[#2e2e2e] flex flex-col sm:flex-row sm:items-start justify-between gap-1"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] border font-bold flex-shrink-0 ${getTypeBadge(log.type)}`}>
                    {log.type}
                  </span>
                  <span className="text-[#dddddd] break-all">{log.message}</span>
                </div>
                <span className="text-[10px] text-kuboo-textMuted flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-kuboo-textMuted">
              No logs recorded yet.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#333333] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-semibold rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
