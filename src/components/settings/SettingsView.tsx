import React from 'react'
import { Login, KubooSettings, AppTheme, HomeLayout, ScaleType } from '../../types'
import {
  Server,
  Plus,
  Edit2,
  Trash2,
  Check,
  Palette,
  BookOpen,
  Layout,
  Clock,
  Terminal,
  HelpCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react'

interface SettingsViewProps {
  settings: KubooSettings
  logins: Login[]
  activeLogin: Login
  onUpdateSettings: (updates: Partial<KubooSettings>) => void
  onSelectActiveLogin: (login: Login) => void
  onAddServer: () => void
  onEditServer: (login: Login) => void
  onDeleteServer: (id: number) => void
  onClearRecents: () => void
  onOpenAbout: () => void
  onOpenLogs: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  logins,
  activeLogin,
  onUpdateSettings,
  onSelectActiveLogin,
  onAddServer,
  onEditServer,
  onDeleteServer,
  onClearRecents,
  onOpenAbout,
  onOpenLogs
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 text-white select-none">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        Settings &amp; Servers
      </h2>

      {/* Servers Management Section */}
      <section className="bg-[#242424] border border-[#383838] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-kuboo-accent" />
            <h3 className="font-bold text-base">Ubooquity Servers</h3>
          </div>
          <button
            onClick={onAddServer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kuboo-accent hover:bg-kuboo-accentLight text-black text-xs font-bold rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>

        <div className="space-y-2.5">
          {logins.map(login => {
            const isActive = login.id === activeLogin.id
            return (
              <div
                key={login.id}
                onClick={() => onSelectActiveLogin(login)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-[#2c2c2c] border-kuboo-accent ring-1 ring-kuboo-accent/50'
                    : 'bg-[#1c1c1c] border-[#333333] hover:border-[#444444]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-kuboo-accent text-black' : 'border border-[#555555]'
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate text-white">
                        {login.nickname}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-kuboo-accent/20 text-kuboo-accentLight rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-kuboo-textMuted font-mono truncate mt-0.5">
                      {login.server}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onEditServer(login)}
                    className="p-1.5 text-kuboo-textMuted hover:text-white rounded hover:bg-[#383838] transition-colors"
                    title="Edit server"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {logins.length > 1 && (
                    <button
                      onClick={() => onDeleteServer(login.id)}
                      className="p-1.5 text-kuboo-textMuted hover:text-red-400 rounded hover:bg-[#383838] transition-colors"
                      title="Delete server"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Appearance / Themes Section */}
      <section className="bg-[#242424] border border-[#383838] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-kuboo-accent" />
          <h3 className="font-bold text-base">Appearance</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onUpdateSettings({ appTheme: AppTheme.DARK })}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              settings.appTheme === AppTheme.DARK
                ? 'bg-[#2c2c2c] border-kuboo-accent ring-1 ring-kuboo-accent/50'
                : 'bg-[#1c1c1c] border-[#333333] hover:border-[#444444]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm">Dark Theme</span>
              <div className="w-4 h-4 rounded-full bg-[#212121] border border-[#444444]" />
            </div>
            <p className="text-xs text-kuboo-textMuted">
              Classic Kuboo dark charcoal #212121
            </p>
          </button>

          <button
            onClick={() => onUpdateSettings({ appTheme: AppTheme.OLED })}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              settings.appTheme === AppTheme.OLED
                ? 'bg-[#2c2c2c] border-kuboo-accent ring-1 ring-kuboo-accent/50'
                : 'bg-[#1c1c1c] border-[#333333] hover:border-[#444444]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm">OLED Black</span>
              <div className="w-4 h-4 rounded-full bg-black border border-[#444444]" />
            </div>
            <p className="text-xs text-kuboo-textMuted">
              Pure #000000 black for maximum contrast
            </p>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#cccccc] mb-2">
            Home Screen Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: HomeLayout.RECENTLY_VIEWED_ONLY, label: 'Recents Only' },
              { id: HomeLayout.LATEST_ONLY, label: 'Latest Only' },
              { id: HomeLayout.BOTH, label: 'Both' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onUpdateSettings({ homeLayout: item.id })}
                className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                  settings.homeLayout === item.id
                    ? 'bg-kuboo-accent text-black border-kuboo-accent'
                    : 'bg-[#1c1c1c] text-[#bbbbbb] border-[#333333] hover:bg-[#282828]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reader Default Preferences */}
      <section className="bg-[#242424] border border-[#383838] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-kuboo-accent" />
          <h3 className="font-bold text-base">Comic Reader Defaults</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[#333333]">
            <div>
              <span className="font-semibold text-sm text-white">Default Dual Pane</span>
              <p className="text-xs text-kuboo-textMuted">Show two comic pages side-by-side</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ dualPane: !settings.dualPane })}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                settings.dualPane ? 'bg-kuboo-accent' : 'bg-[#3e3e3e]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.dualPane ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#333333]">
            <div>
              <span className="font-semibold text-sm text-white">Default Manga RTL Mode</span>
              <p className="text-xs text-kuboo-textMuted">Read pages right-to-left for Japanese manga</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ mangaRtl: !settings.mangaRtl })}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                settings.mangaRtl ? 'bg-kuboo-accent' : 'bg-[#3e3e3e]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.mangaRtl ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cccccc] mb-2">
              Default Image Scaling
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: ScaleType.ASPECT_FIT, label: 'Aspect Fit' },
                { id: ScaleType.ASPECT_FILL, label: 'Aspect Fill' },
                { id: ScaleType.FIT_WIDTH, label: 'Fit Width' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => onUpdateSettings({ scaleType: item.id })}
                  className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                    settings.scaleType === item.id
                      ? 'bg-kuboo-accent text-black border-kuboo-accent'
                      : 'bg-[#1c1c1c] text-[#bbbbbb] border-[#333333] hover:bg-[#282828]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data & History Section */}
      <section className="bg-[#242424] border border-[#383838] rounded-xl p-5 shadow-xs">
        <h3 className="font-bold text-base text-white mb-3">Data &amp; Tools</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#333333]">
            <div>
              <span className="text-sm font-semibold">Clear Reading History</span>
              <p className="text-xs text-kuboo-textMuted">Remove all entries from Recently Viewed</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your reading history?')) {
                  onClearRecents()
                }
              }}
              className="px-3 py-1.5 rounded bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold transition-colors"
            >
              Clear Recents
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#333333]">
            <div>
              <span className="text-sm font-semibold">Activity &amp; Network Logs</span>
              <p className="text-xs text-kuboo-textMuted">Inspect OPDS requests and reader diagnostic events</p>
            </div>
            <button
              onClick={onOpenLogs}
              className="px-3 py-1.5 rounded bg-[#333333] hover:bg-[#404040] text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-kuboo-accent" />
              View Logs
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-semibold">About Kuboo3</span>
              <p className="text-xs text-kuboo-textMuted">Version, open-source license &amp; developer notes</p>
            </div>
            <button
              onClick={onOpenAbout}
              className="px-3 py-1.5 rounded bg-[#333333] hover:bg-[#404040] text-xs font-semibold text-white transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
