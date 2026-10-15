import React, { useState } from 'react'
import { Login } from '../../types'
import { ApiService } from '../../services/api'
import { X, Server, Check, AlertCircle, Loader2 } from 'lucide-react'

interface ServerModalProps {
  loginToEdit?: Login | null
  onClose: () => void
  onSave: (loginData: Omit<Login, 'id' | 'timeAccessed'>, id?: number) => void
}

export const ServerModal: React.FC<ServerModalProps> = ({
  loginToEdit,
  onClose,
  onSave
}) => {
  const [nickname, setNickname] = useState(loginToEdit?.nickname || '')
  const [serverUrl, setServerUrl] = useState(loginToEdit?.server || 'http://')
  const [username, setUsername] = useState(loginToEdit?.username || '')
  const [password, setPassword] = useState(loginToEdit?.password || '')

  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message?: string
    durationMs?: number
    error?: string
  } | null>(null)

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    const res = await ApiService.pingServer({
      server: serverUrl.trim(),
      username: username.trim(),
      password: password.trim()
    })
    setTestResult(res)
    setIsTesting(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !serverUrl.trim()) return

    let formattedUrl = serverUrl.trim()
    if (!formattedUrl.endsWith('/')) {
      formattedUrl += '/'
    }

    onSave(
      {
        nickname: nickname.trim(),
        server: formattedUrl,
        username: username.trim(),
        password: password.trim()
      },
      loginToEdit?.id
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-kuboo-accent" />
            <h3 className="text-lg font-bold text-white">
              {loginToEdit ? 'Edit Server' : 'Add Ubooquity Server'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-kuboo-textMuted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#cccccc] mb-1">
              Server Nickname
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="e.g. Home Server"
              className="w-full bg-[#181818] border border-[#3c3c3c] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-kuboo-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cccccc] mb-1">
              Server OPDS URL
            </label>
            <input
              type="text"
              required
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              placeholder="http://192.168.0.1:2202/opds/"
              className="w-full bg-[#181818] border border-[#3c3c3c] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-kuboo-accent font-mono text-xs"
            />
            <p className="text-[11px] text-kuboo-textMuted mt-1">
              Examples:<br />
              • Ubooquity 3: <code>http://192.168.0.1:2202/opds/</code><br />
              • Ubooquity 2: <code>http://192.168.0.1:2202/opds-comics/</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                Username (optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#181818] border border-[#3c3c3c] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-kuboo-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                Password (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#181818] border border-[#3c3c3c] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-kuboo-accent"
              />
            </div>
          </div>

          {/* Connection Test Output */}
          {testResult && (
            <div
              className={`p-3 rounded text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                  : 'bg-red-950/60 border border-red-800 text-red-200'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <div className="truncate">
                {testResult.success
                  ? `Connected successfully! (${testResult.durationMs}ms)`
                  : testResult.error || 'Server connection failed'}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !serverUrl.trim()}
              className="px-3 py-2 bg-[#333333] hover:bg-[#404040] text-xs font-semibold rounded text-white flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 bg-transparent hover:bg-white/10 text-xs font-semibold rounded text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-kuboo-accent hover:bg-kuboo-accentLight text-black text-xs font-bold rounded transition-colors shadow"
              >
                Save Server
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
