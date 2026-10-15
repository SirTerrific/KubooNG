export interface Book {
  autoId?: number
  id: number
  title: string
  author: string
  content: string
  linkAcquisition: string
  linkSubsection: string
  linkThumbnail: string
  linkXmlPath: string
  linkPrevious: string
  linkNext: string
  linkPse: string
  currentPage: number
  totalPages: number
  server: string
  filePath?: string
  bookMark?: string
  isFavorite?: boolean
  isFinished?: boolean
  timeAccessed?: number
  // For local or demo books:
  pages?: string[]
}

export interface Login {
  id: number
  nickname: string
  server: string
  username: string
  password: string
  timeAccessed: number
}

export interface Pagination {
  currentPage: number
  totalPages: number
  firstUrl: string
  lastUrl: string
  nextUrl: string
  previousUrl: string
}

export interface RecentItem {
  id: string
  book: Book
  timestamp: number
  currentPage: number
  totalPages: number
}

export interface FavoriteItem {
  id: string
  book: Book
  timestamp: number
}

export interface DownloadItem {
  id: string
  book: Book
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress: number
  downloadDate: number
  fileBlob?: Blob
  pageUrls?: string[]
}

export interface LogItem {
  id: string
  timestamp: number
  type: 'INFO' | 'WARN' | 'ERROR' | 'NETWORK' | 'READER'
  message: string
  details?: string
}

export enum ScaleType {
  ASPECT_FILL = 0,
  ASPECT_FIT = 1,
  FIT_WIDTH = 2
}

export enum HomeLayout {
  RECENTLY_VIEWED_ONLY = 0,
  LATEST_ONLY = 1,
  BOTH = 2
}

export enum AppTheme {
  LIGHT = 0,
  DARK = 1,
  OLED = 2
}

export interface KubooSettings {
  appTheme: AppTheme
  homeLayout: HomeLayout
  scaleType: ScaleType
  dualPane: boolean
  mangaRtl: boolean
  maxPageWidth: number
  keepScreenOn: boolean
  volumePageTurn: boolean
  browserMediaForceList: boolean
  downloadFinishedNotification: boolean
  downloadTrackingLimit: number
  epubTextZoom: number
  epubMarginSize: number
  activeLoginId: number | null
}
