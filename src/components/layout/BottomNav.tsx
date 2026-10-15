import React from 'react'
import { Home, Compass, Download, Settings } from 'lucide-react'

export type NavTab = 'home' | 'browse' | 'downloads' | 'settings'

interface BottomNavProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  downloadsCount: number
  isOledTheme?: boolean
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  downloadsCount,
  isOledTheme = false
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'browse' as NavTab, label: 'Browse', icon: Compass },
    { id: 'downloads' as NavTab, label: 'Downloads', icon: Download, badge: downloadsCount },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ]

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 h-16 border-t select-none transition-colors ${
        isOledTheme
          ? 'bg-black border-[#222222]'
          : 'bg-[#212121] border-[#333333]'
      } shadow-lg`}
    >
      <div className="max-w-md mx-auto h-full flex items-center justify-around px-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-kuboo-accent' : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-kuboo-accent text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-kuboo-accent rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
