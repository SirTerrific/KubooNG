import { Book, Login, Pagination } from '../types'
import { OpdsParser } from './opdsParser'
import { DEMO_SERVER, DEMO_BOOKS, DEMO_FOLDERS } from './demoData'
import { StorageService } from './storage'

export class ApiService {
  static async pingServer(login: Partial<Login>): Promise<{ success: boolean; durationMs?: number; message?: string; error?: string }> {
    if (login.server === DEMO_SERVER.server || login.id === DEMO_SERVER.id) {
      return { success: true, durationMs: 12, message: 'Built-in Demo Library connected' }
    }

    try {
      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: login.server,
          username: login.username,
          password: login.password
        })
      })
      const data = await res.json()
      return data
    } catch (err: any) {
      return { success: false, error: err.message || 'Network request failed' }
    }
  }

  static async fetchFeed(
    login: Login,
    feedPath: string = ''
  ): Promise<{ books: Book[]; folders: Book[]; pagination: Pagination }> {
    // If Demo Server
    if (login.server === DEMO_SERVER.server || login.id === DEMO_SERVER.id) {
      // Simulate quick network latency
      await new Promise(r => setTimeout(r, 120))

      if (!feedPath || feedPath === 'all' || feedPath === '' || feedPath.includes('groupByFolder=true')) {
        return {
          books: DEMO_BOOKS,
          folders: DEMO_FOLDERS,
          pagination: { currentPage: 1, totalPages: 1, firstUrl: '', lastUrl: '', nextUrl: '', previousUrl: '' }
        }
      }

      if (feedPath.includes('comics')) {
        return {
          books: DEMO_BOOKS.filter(b => b.linkAcquisition.includes('comics') || b.id <= 104),
          folders: [],
          pagination: { currentPage: 1, totalPages: 1, firstUrl: '', lastUrl: '', nextUrl: '', previousUrl: '' }
        }
      }

      if (feedPath.includes('manga')) {
        return {
          books: DEMO_BOOKS.filter(b => b.id === 103),
          folders: [],
          pagination: { currentPage: 1, totalPages: 1, firstUrl: '', lastUrl: '', nextUrl: '', previousUrl: '' }
        }
      }

      if (feedPath.includes('books')) {
        return {
          books: DEMO_BOOKS.filter(b => b.id === 105),
          folders: [],
          pagination: { currentPage: 1, totalPages: 1, firstUrl: '', lastUrl: '', nextUrl: '', previousUrl: '' }
        }
      }

      // Default demo return
      return {
        books: DEMO_BOOKS,
        folders: DEMO_FOLDERS,
        pagination: { currentPage: 1, totalPages: 1, firstUrl: '', lastUrl: '', nextUrl: '', previousUrl: '' }
      }
    }

    // Live Remote OPDS Server
    try {
      const res = await fetch('/api/opds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: login.server,
          path: feedPath,
          username: login.username,
          password: login.password
        })
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || `Server responded with ${res.status}`)
      }

      const xmlText = await res.text()
      const parsed = OpdsParser.parse(xmlText, login.server)
      StorageService.addLog('NETWORK', `Fetched OPDS feed: ${feedPath || 'root'} (${parsed.books.length} books, ${parsed.folders.length} folders)`)
      return parsed
    } catch (err: any) {
      StorageService.addLog('ERROR', `Failed to fetch OPDS feed: ${err.message}`)
      throw err
    }
  }

  static getCoverUrl(book: Book, login: Login, maxWidth: number = 800): string {
    // If book has direct SVG or data URL (like demo or local book)
    if (book.linkThumbnail && book.linkThumbnail.startsWith('data:')) {
      return book.linkThumbnail
    }
    if (book.pages && book.pages.length > 0) {
      return book.pages[0]
    }

    // Remote Ubooquity 3 logic:
    // If linkPse exists, Ubooquity 3 serves page 0 at /pagereader/{id}?page=0&width={w}
    let target = book.linkThumbnail
    if (book.linkPse) {
      if (book.linkPse.includes('/opds/comicreader/')) {
        const id = book.linkPse.split('/opds/comicreader/')[1]?.split('?')[0]?.replace(/\//g, '')
        if (id) {
          target = `/pagereader/${id}?page=0&width=${maxWidth}`
        }
      } else {
        target = book.linkPse.replace('{pageNumber}', '00').replace('{maxWidth}', String(maxWidth))
      }
    }

    if (!target) return ''

    // Return through proxy to handle auth/session & CORS
    const params = new URLSearchParams()
    params.set('url', target)
    params.set('server', login.server)
    if (login.username) params.set('username', login.username)
    if (login.password) params.set('password', login.password)
    params.set('maxWidth', String(maxWidth))

    return `/api/proxy/image?${params.toString()}`
  }

  static getPageUrl(book: Book, pageIndex: number, login: Login, maxWidth: number = 1500): string {
    // If local or demo pages exist
    if (book.pages && book.pages[pageIndex]) {
      return book.pages[pageIndex]
    }

    let target = ''
    if (book.linkPse) {
      if (book.linkPse.includes('/opds/comicreader/')) {
        const id = book.linkPse.split('/opds/comicreader/')[1]?.split('?')[0]?.replace(/\//g, '')
        if (id) {
          target = `/pagereader/${id}?page=${pageIndex}&width=${maxWidth}`
        }
      } else {
        const formattedIndex = pageIndex < 10 ? `0${pageIndex}` : `${pageIndex}`
        target = book.linkPse.replace('{pageNumber}', formattedIndex).replace('{maxWidth}', String(maxWidth))
      }
    }

    if (!target) return ''

    const params = new URLSearchParams()
    params.set('url', target)
    params.set('server', login.server)
    if (login.username) params.set('username', login.username)
    if (login.password) params.set('password', login.password)
    params.set('maxWidth', String(maxWidth))

    return `/api/proxy/image?${params.toString()}`
  }

  static async sendBookmark(book: Book, page: number, login: Login): Promise<void> {
    if (login.server === DEMO_SERVER.server || login.id === DEMO_SERVER.id) {
      return
    }

    try {
      await fetch('/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: login.server,
          bookId: book.id,
          page,
          username: login.username,
          password: login.password
        })
      })
    } catch (err) {
      // Quiet fail for bookmark network blip
    }
  }
}
