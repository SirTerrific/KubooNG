import React, { useState, useEffect, useCallback } from 'react'
import {
  Book,
  Login,
  KubooSettings,
  RecentItem,
  FavoriteItem,
  DownloadItem,
  LogItem,
  AppTheme,
  HomeLayout
} from './types'
import { StorageService } from './services/storage'
import { ApiService } from './services/api'
import { DEMO_SERVER, DEMO_BOOKS } from './services/demoData'

import { Navbar } from './components/layout/Navbar'
import { BottomNav, NavTab } from './components/layout/BottomNav'
import { HomeView } from './components/home/HomeView'
import { BrowserView } from './components/browse/BrowserView'
import { DownloadsView } from './components/downloads/DownloadsView'
import { SettingsView } from './components/settings/SettingsView'
import { ComicReader } from './components/reader/ComicReader'
import { ServerModal } from './components/dialogs/ServerModal'
import { AboutDialog } from './components/dialogs/AboutDialog'
import { LogDialog } from './components/dialogs/LogDialog'

export const App: React.FC = () => {
  // State
  const [currentTab, setCurrentTab] = useState<NavTab>('home')
  const [settings, setSettings] = useState<KubooSettings>(StorageService.getSettings())
  const [logins, setLogins] = useState<Login[]>(StorageService.getLogins())
  const [activeLogin, setActiveLogin] = useState<Login>(StorageService.getActiveLogin())
  const [recents, setRecents] = useState<RecentItem[]>(StorageService.getRecents())
  const [favorites, setFavorites] = useState<FavoriteItem[]>(StorageService.getFavorites())
  const [downloads, setDownloads] = useState<DownloadItem[]>(StorageService.getDownloads())
  const [logs, setLogs] = useState<LogItem[]>(StorageService.getLogs())

  const [isGridView, setIsGridView] = useState(true)

  // Browser state
  const [folders, setFolders] = useState<Book[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [pathHistory, setPathHistory] = useState<{ name: string; url: string }[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    firstUrl: '',
    lastUrl: '',
    nextUrl: '',
    previousUrl: ''
  })
  const [isFeedLoading, setIsFeedLoading] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)

  // Reader state
  const [readingBook, setReadingBook] = useState<Book | null>(null)
  const [readingInitialPage, setReadingInitialPage] = useState(0)

  // Dialogs
  const [showAbout, setShowAbout] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showServerModal, setShowServerModal] = useState(false)
  const [loginToEdit, setLoginToEdit] = useState<Login | null>(null)

  // Sync theme class to document
  useEffect(() => {
    if (settings.appTheme === AppTheme.OLED) {
      document.documentElement.classList.add('oled-theme')
      document.body.style.backgroundColor = '#000000'
    } else {
      document.documentElement.classList.remove('oled-theme')
      document.body.style.backgroundColor = '#1e1e1e'
    }
  }, [settings.appTheme])

  // Load feed when activeLogin or current tab changes to browse
  const loadFeed = useCallback(async (path: string = '') => {
    setIsFeedLoading(true)
    setFeedError(null)
    try {
      const data = await ApiService.fetchFeed(activeLogin, path)
      setBooks(data.books)
      setFolders(data.folders)
      setPagination(data.pagination)
    } catch (err: any) {
      setFeedError(err.message || 'Failed to connect to Ubooquity feed')
    } finally {
      setIsFeedLoading(false)
    }
  }, [activeLogin])

  useEffect(() => {
    loadFeed('')
    setPathHistory([])
  }, [activeLogin, loadFeed])

  // Browser folder navigation
  const handleOpenFolder = (folder: Book) => {
    const nextPath = folder.linkSubsection || folder.linkXmlPath
    const newHistory = [...pathHistory, { name: folder.title, url: nextPath }]
    setPathHistory(newHistory)
    loadFeed(nextPath)
  }

  const handleNavigatePath = (index: number) => {
    if (index === 0) {
      setPathHistory([])
      loadFeed('')
    } else {
      const target = pathHistory[index - 1]
      const trimmed = pathHistory.slice(0, index)
      setPathHistory(trimmed)
      loadFeed(target.url)
    }
  }

  const handlePageChange = (direction: 'next' | 'previous') => {
    const url = direction === 'next' ? pagination.nextUrl : pagination.previousUrl
    if (url) {
      loadFeed(url)
    }
  }

  const handleSearchSubmit = (query: string) => {
    setCurrentTab('browse')
    const searchUrl = `?search=true&searchstring=${encodeURIComponent(query)}`
    setPathHistory([{ name: `Search: "${query}"`, url: searchUrl }])
    loadFeed(searchUrl)
  }

  // Reader actions
  const handleOpenBook = (book: Book, initialPage: number = 0) => {
    setReadingBook(book)
    setReadingInitialPage(initialPage)
  }

  const handleSaveProgress = (book: Book, page: number) => {
    StorageService.recordRecentRead(book, page)
    setRecents(StorageService.getRecents())
    setLogs(StorageService.getLogs())
  }

  const handleToggleFavorite = (book: Book) => {
    StorageService.toggleFavorite(book)
    setFavorites(StorageService.getFavorites())
    setRecents(StorageService.getRecents())
    setLogs(StorageService.getLogs())
  }

  const handleDownloadBook = (book: Book) => {
    StorageService.addDownload(book)
    setDownloads(StorageService.getDownloads())
    setLogs(StorageService.getLogs())
  }

  const handleDeleteDownload = (id: string) => {
    StorageService.removeDownload(id)
    setDownloads(StorageService.getDownloads())
  }

  const handleImportLocalBook = (book: Book) => {
    StorageService.addDownload(book)
    setDownloads(StorageService.getDownloads())
    handleOpenBook(book, 0)
  }

  // Settings & Servers
  const handleUpdateSettings = (updates: Partial<KubooSettings>) => {
    const updated = StorageService.saveSettings(updates)
    setSettings(updated)
  }

  const handleSelectActiveLogin = (login: Login) => {
    setActiveLogin(login)
    handleUpdateSettings({ activeLoginId: login.id })
    StorageService.addLog('INFO', `Switched active server to: ${login.nickname}`)
    setLogs(StorageService.getLogs())
  }

  const handleSaveServer = (loginData: Omit<Login, 'id' | 'timeAccessed'>, id?: number) => {
    if (id !== undefined) {
      StorageService.updateLogin(id, loginData)
    } else {
      const added = StorageService.addLogin(loginData)
      handleSelectActiveLogin(added)
    }
    setLogins(StorageService.getLogins())
    setActiveLogin(StorageService.getActiveLogin())
    setLogs(StorageService.getLogs())
  }

  const handleDeleteServer = (id: number) => {
    StorageService.deleteLogin(id)
    const updatedLogins = StorageService.getLogins()
    setLogins(updatedLogins)
    const active = StorageService.getActiveLogin()
    setActiveLogin(active)
    setLogs(StorageService.getLogs())
  }

  const handleClearRecents = () => {
    StorageService.clearAllRecents()
    setRecents([])
    setLogs(StorageService.getLogs())
  }

  const handleClearLogs = () => {
    StorageService.clearLogs()
    setLogs([])
  }

  // Next book in series
  const handleOpenNextBook = (current: Book) => {
    if (current.linkNext) {
      // Find book matching linkNext
      const found = books.find(b => b.linkXmlPath === current.linkNext || b.id === current.id + 1)
      if (found) {
        handleOpenBook(found, 0)
      } else {
        alert('Next book in series reached!')
      }
    }
  }

  const getNavbarTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'Kuboo'
      case 'browse':
        return pathHistory.length > 0 ? pathHistory[pathHistory.length - 1].name : 'Browse Library'
      case 'downloads':
        return 'Downloads & Offline'
      case 'settings':
        return 'Settings'
    }
  }

  return (
    <div className={`min-h-screen text-[#eeeeee] flex flex-col font-sans transition-colors ${
      settings.appTheme === AppTheme.OLED ? 'bg-black' : 'bg-[#1e1e1e]'
    }`}>
      {/* Top Navbar */}
      <Navbar
        title={getNavbarTitle()}
        activeLogin={activeLogin}
        isGridView={isGridView}
        onToggleGridView={() => setIsGridView(!isGridView)}
        onSearchSubmit={handleSearchSubmit}
        onRefresh={() => loadFeed(pathHistory.length > 0 ? pathHistory[pathHistory.length - 1].url : '')}
        onOpenAbout={() => setShowAbout(true)}
        onOpenLogs={() => setShowLogs(true)}
        onOpenServerModal={() => {
          setLoginToEdit(null)
          setShowServerModal(true)
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            activeLogin={activeLogin}
            recentItems={recents}
            favoriteItems={favorites}
            latestBooks={books.length > 0 ? books : DEMO_BOOKS}
            homeLayout={settings.homeLayout}
            onOpenBook={handleOpenBook}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToBrowse={() => setCurrentTab('browse')}
            isGridView={isGridView}
          />
        )}

        {currentTab === 'browse' && (
          <BrowserView
            activeLogin={activeLogin}
            folders={folders}
            books={books}
            pathHistory={pathHistory}
            pagination={pagination}
            isGridView={isGridView}
            isLoading={isFeedLoading}
            error={feedError}
            onOpenFolder={handleOpenFolder}
            onNavigatePath={handleNavigatePath}
            onOpenBook={handleOpenBook}
            onToggleFavorite={handleToggleFavorite}
            onDownloadBook={handleDownloadBook}
            onPageChange={handlePageChange}
          />
        )}

        {currentTab === 'downloads' && (
          <DownloadsView
            downloads={downloads}
            activeLogin={activeLogin}
            onOpenBook={handleOpenBook}
            onDeleteDownload={handleDeleteDownload}
            onImportLocalBook={handleImportLocalBook}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            logins={logins}
            activeLogin={activeLogin}
            onUpdateSettings={handleUpdateSettings}
            onSelectActiveLogin={handleSelectActiveLogin}
            onAddServer={() => {
              setLoginToEdit(null)
              setShowServerModal(true)
            }}
            onEditServer={l => {
              setLoginToEdit(l)
              setShowServerModal(true)
            }}
            onDeleteServer={handleDeleteServer}
            onClearRecents={handleClearRecents}
            onOpenAbout={() => setShowAbout(true)}
            onOpenLogs={() => setShowLogs(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        downloadsCount={downloads.length}
        isOledTheme={settings.appTheme === AppTheme.OLED}
      />

      {/* Comic Reader Modal */}
      {readingBook && (
        <ComicReader
          book={readingBook}
          initialPage={readingInitialPage}
          activeLogin={activeLogin}
          defaultDualPane={settings.dualPane}
          defaultMangaRtl={settings.mangaRtl}
          defaultScaleType={settings.scaleType}
          onClose={() => setReadingBook(null)}
          onSaveProgress={handleSaveProgress}
          onToggleFavorite={handleToggleFavorite}
          onOpenNextBook={handleOpenNextBook}
        />
      )}

      {/* Server Modal */}
      {showServerModal && (
        <ServerModal
          loginToEdit={loginToEdit}
          onClose={() => {
            setShowServerModal(false)
            setLoginToEdit(null)
          }}
          onSave={handleSaveServer}
        />
      )}

      {/* About Dialog */}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}

      {/* Logs Dialog */}
      {showLogs && (
        <LogDialog
          logs={logs}
          onClearLogs={handleClearLogs}
          onClose={() => setShowLogs(false)}
        />
      )}
    </div>
  )
}
export default App
