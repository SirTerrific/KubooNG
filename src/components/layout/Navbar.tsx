import React, { useState } from 'react'
import { Search, LayoutGrid, List, Info, Server, ShieldCheck, ShieldAlert, MoreVertical, BookOpen, RefreshCw, X } from 'lucide-react'
import { Login } from '../../types'

interface NavbarProps {
  title: string
  activeLogin: Login
  isGridView: boolean
  onToggleGridView: () => void
  onSearchSubmit: (query: string) => void
  onRefresh: () => void
  onOpenAbout: () => void
  onOpenLogs: () => void
  onOpenServerModal: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  activeLogin,
  isGridView,
  onToggleGridView,
  onSearchSubmit,
  onRefresh,
  onOpenAbout,
  onOpenLogs,
  onOpenServerModal
}) => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showHttpsInfo, setShowHttpsInfo] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim())
    }
  }

  const isHttps = activeLogin.server.toLowerCase().startsWith('https://')

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#212121] border-b border-[#333333] shadow-md select-none">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Left section: Title or Search Box */}
          {isSearching ? (
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-kuboo-textMuted flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search comic titles, authors..."
                autoFocus
                className="w-full bg-[#181818] text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-kuboo-accent border border-[#3c3c3c]"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false)
                  setSearchQuery('')
                }}
                className="p-1.5 text-kuboo-textMuted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#FF5252] to-[#D32F2F] shadow-sm text-white flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-base sm:text-lg text-white truncate leading-tight">
                  {title}
                </h1>
                <button
                  onClick={onOpenServerModal}
                  className="flex items-center gap-1.5 text-xs text-kuboo-textMuted hover:text-white transition-colors truncate"
                  title="Active server - click to change"
                >
                  <Server className="w-3 h-3 flex-shrink-0 text-kuboo-accent" />
                  <span className="truncate max-w-[160px] sm:max-w-xs">{activeLogin.nickname}</span>
                </button>
              </div>
            </div>
          )}

          {/* Right section: Action Buttons */}
          {!isSearching && (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setIsSearching(true)}
                className="p-2 text-kuboo-textMuted hover:text-white rounded hover:bg-[#2c2c2c] transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={onToggleGridView}
                className="p-2 text-kuboo-textMuted hover:text-white rounded hover:bg-[#2c2c2c] transition-colors"
                title={isGridView ? "Switch to List View" : "Switch to Grid View"}
              >
                {isGridView ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowHttpsInfo(true)}
                className="p-2 text-kuboo-textMuted hover:text-white rounded hover:bg-[#2c2c2c] transition-colors"
                title={isHttps ? "Secure HTTPS connection" : "HTTP connection (Proxied)"}
              >
                {isHttps ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                )}
              </button>

              <button
                onClick={onRefresh}
                className="p-2 text-kuboo-textMuted hover:text-white rounded hover:bg-[#2c2c2c] transition-colors"
                title="Refresh feed"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Overflow Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-kuboo-textMuted hover:text-white rounded hover:bg-[#2c2c2c] transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-[#282828] border border-[#3c3c3c] rounded-md shadow-xl py-1 z-50 text-sm">
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          onOpenServerModal()
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#333333] text-[#eeeeee] flex items-center gap-2"
                      >
                        <Server className="w-4 h-4 text-kuboo-accent" />
                        Manage Servers
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          onOpenLogs()
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#333333] text-[#eeeeee] flex items-center gap-2"
                      >
                        <Info className="w-4 h-4" />
                        Activity Logs
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          onOpenAbout()
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#333333] text-[#eeeeee] flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        About Kuboo3
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HTTPS Info Modal (Matching BaseActivityImpl1_Dialog showDialogHttps) */}
      {showHttpsInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#282828] border border-[#444444] rounded-lg max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              {isHttps ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-amber-400" />
              )}
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isHttps ? "Secure Connection" : "Connection Notice"}
                </h3>
                <p className="text-xs text-kuboo-textMuted">
                  {activeLogin.server}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#cccccc] mb-4 leading-relaxed">
              {isHttps
                ? "This connection uses transport encryption (HTTPS). Your login credentials and comic data are encrypted in transit."
                : "This server uses plain HTTP. Kuboo3 proxies requests securely through the application server to prevent browser CORS and mixed-content issues."}
            </p>
            <div className="bg-[#1f1f1f] p-3 rounded text-xs font-mono text-[#bbbbbb] mb-4 break-all">
              Server: {activeLogin.server}<br />
              Auth: {activeLogin.username ? `User "${activeLogin.username}"` : "Anonymous"}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowHttpsInfo(false)}
                className="px-4 py-2 bg-kuboo-accent hover:bg-kuboo-accentLight text-black font-semibold rounded text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
