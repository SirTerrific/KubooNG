import { Book, Login, KubooSettings, RecentItem, FavoriteItem, DownloadItem, LogItem, AppTheme, HomeLayout, ScaleType } from '../types'
import { DEMO_SERVER, DEMO_BOOKS } from './demoData'

const STORAGE_KEYS = {
  SETTINGS: 'kuboo_settings',
  LOGINS: 'kuboo_logins',
  ACTIVE_LOGIN: 'kuboo_active_login_id',
  RECENTS: 'kuboo_recents',
  FAVORITES: 'kuboo_favorites',
  DOWNLOADS: 'kuboo_downloads',
  LOGS: 'kuboo_logs'
}

export const DEFAULT_SETTINGS: KubooSettings = {
  appTheme: AppTheme.DARK,
  homeLayout: HomeLayout.BOTH,
  scaleType: ScaleType.ASPECT_FIT,
  dualPane: false,
  mangaRtl: false,
  maxPageWidth: 1500,
  keepScreenOn: true,
  volumePageTurn: false,
  browserMediaForceList: false,
  downloadFinishedNotification: true,
  downloadTrackingLimit: 3,
  epubTextZoom: 120,
  epubMarginSize: 24,
  activeLoginId: DEMO_SERVER.id
}

export class StorageService {
  // Settings
  static getSettings(): KubooSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
    } catch (e) {
      console.error('Error loading settings', e)
    }
    return DEFAULT_SETTINGS
  }

  static saveSettings(settings: Partial<KubooSettings>): KubooSettings {
    const current = this.getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
    return updated
  }

  // Servers / Logins
  static getLogins(): Login[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGINS)
      if (data) {
        const logins: Login[] = JSON.parse(data)
        if (logins.length > 0) return logins
      }
    } catch (e) {
      console.error('Error loading logins', e)
    }
    // Initialize with Demo Server
    const initial = [DEMO_SERVER]
    this.saveLogins(initial)
    return initial
  }

  static saveLogins(logins: Login[]) {
    localStorage.setItem(STORAGE_KEYS.LOGINS, JSON.stringify(logins))
  }

  static addLogin(login: Omit<Login, 'id' | 'timeAccessed'>): Login {
    const logins = this.getLogins()
    const newId = logins.length > 0 ? Math.max(...logins.map(l => l.id)) + 1 : 1
    const newLogin: Login = {
      ...login,
      id: newId,
      timeAccessed: Date.now()
    }
    logins.push(newLogin)
    this.saveLogins(logins)
    this.addLog('INFO', `Added new server: ${newLogin.nickname} (${newLogin.server})`)
    return newLogin
  }

  static updateLogin(id: number, updates: Partial<Login>): Login | null {
    const logins = this.getLogins()
    const idx = logins.findIndex(l => l.id === id)
    if (idx === -1) return null
    logins[idx] = { ...logins[idx], ...updates, timeAccessed: Date.now() }
    this.saveLogins(logins)
    this.addLog('INFO', `Updated server: ${logins[idx].nickname}`)
    return logins[idx]
  }

  static deleteLogin(id: number): boolean {
    const logins = this.getLogins()
    const filtered = logins.filter(l => l.id !== id)
    this.saveLogins(filtered)
    this.addLog('INFO', `Deleted server ID: ${id}`)
    return true
  }

  static getActiveLogin(): Login {
    const logins = this.getLogins()
    const settings = this.getSettings()
    const found = logins.find(l => l.id === settings.activeLoginId)
    return found || logins[0] || DEMO_SERVER
  }

  // Recents
  static getRecents(): RecentItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENTS)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error('Error loading recents', e)
    }
    // Seed default recents from demo data
    const seed: RecentItem[] = [
      {
        id: `demo_${DEMO_BOOKS[0].id}`,
        book: DEMO_BOOKS[0],
        timestamp: Date.now() - 1000 * 60 * 30,
        currentPage: 2,
        totalPages: DEMO_BOOKS[0].totalPages
      },
      {
        id: `demo_${DEMO_BOOKS[1].id}`,
        book: DEMO_BOOKS[1],
        timestamp: Date.now() - 1000 * 60 * 120,
        currentPage: 4,
        totalPages: DEMO_BOOKS[1].totalPages
      }
    ]
    this.saveRecents(seed)
    return seed
  }

  static saveRecents(recents: RecentItem[]) {
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(recents))
  }

  static recordRecentRead(book: Book, page: number): RecentItem {
    const recents = this.getRecents()
    const id = `${book.server}_${book.id}`
    const existingIdx = recents.findIndex(r => r.id === id || (r.book.id === book.id && r.book.server === book.server))
    
    const updatedBook = { ...book, currentPage: page }
    const item: RecentItem = {
      id,
      book: updatedBook,
      timestamp: Date.now(),
      currentPage: page,
      totalPages: book.totalPages
    }

    if (existingIdx !== -1) {
      recents.splice(existingIdx, 1)
    }
    recents.unshift(item)
    // keep top 50
    const trimmed = recents.slice(0, 50)
    this.saveRecents(trimmed)
    this.addLog('READER', `Reading progress saved for "${book.title}" on page ${page + 1}`)
    return item
  }

  static removeRecent(id: string) {
    const recents = this.getRecents().filter(r => r.id !== id)
    this.saveRecents(recents)
  }

  static clearAllRecents() {
    this.saveRecents([])
    this.addLog('INFO', 'Cleared all recently read books history')
  }

  // Favorites
  static getFavorites(): FavoriteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error('Error loading favorites', e)
    }
    const seed: FavoriteItem[] = [
      {
        id: `demo_${DEMO_BOOKS[0].id}`,
        book: DEMO_BOOKS[0],
        timestamp: Date.now()
      }
    ]
    this.saveFavorites(seed)
    return seed
  }

  static saveFavorites(favs: FavoriteItem[]) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs))
  }

  static toggleFavorite(book: Book): boolean {
    const favs = this.getFavorites()
    const id = `${book.server}_${book.id}`
    const idx = favs.findIndex(f => f.id === id || (f.book.id === book.id && f.book.server === book.server))

    if (idx !== -1) {
      favs.splice(idx, 1)
      this.saveFavorites(favs)
      this.addLog('INFO', `Removed favorite: ${book.title}`)
      return false
    } else {
      favs.unshift({ id, book: { ...book, isFavorite: true }, timestamp: Date.now() })
      this.saveFavorites(favs)
      this.addLog('INFO', `Added favorite: ${book.title}`)
      return true
    }
  }

  static isFavorite(book: Book): boolean {
    const favs = this.getFavorites()
    return favs.some(f => (f.book.id === book.id && f.book.server === book.server))
  }

  // Downloads
  static getDownloads(): DownloadItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error('Error loading downloads', e)
    }
    // Initial completed download for demo
    const seed: DownloadItem[] = [
      {
        id: `dl_${DEMO_BOOKS[0].id}`,
        book: DEMO_BOOKS[0],
        status: 'completed',
        progress: 100,
        downloadDate: Date.now() - 3600000,
        pageUrls: DEMO_BOOKS[0].pages
      }
    ]
    this.saveDownloads(seed)
    return seed
  }

  static saveDownloads(downloads: DownloadItem[]) {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads))
  }

  static addDownload(book: Book): DownloadItem {
    const downloads = this.getDownloads()
    const id = `dl_${book.server}_${book.id}`
    const existing = downloads.find(d => d.id === id)
    if (existing) return existing

    const item: DownloadItem = {
      id,
      book,
      status: 'downloading',
      progress: 0,
      downloadDate: Date.now(),
      pageUrls: book.pages || []
    }
    downloads.unshift(item)
    this.saveDownloads(downloads)
    this.addLog('INFO', `Started download for "${book.title}"`)
    return item
  }

  static updateDownload(id: string, updates: Partial<DownloadItem>) {
    const downloads = this.getDownloads()
    const idx = downloads.findIndex(d => d.id === id)
    if (idx !== -1) {
      downloads[idx] = { ...downloads[idx], ...updates }
      this.saveDownloads(downloads)
    }
  }

  static removeDownload(id: string) {
    const downloads = this.getDownloads().filter(d => d.id !== id)
    this.saveDownloads(downloads)
    this.addLog('INFO', `Deleted download: ${id}`)
  }

  // Logs
  static getLogs(): LogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error('Error loading logs', e)
    }
    return []
  }

  static addLog(type: LogItem['type'], message: string, details?: string) {
    try {
      const logs = this.getLogs()
      const newItem: LogItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        type,
        message,
        details
      }
      logs.unshift(newItem)
      // Keep up to 1000 logs like Android Settings.LOG_LIMIT
      const trimmed = logs.slice(0, 500)
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trimmed))
    } catch (e) {
      // ignore
    }
  }

  static clearLogs() {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]))
  }
}
