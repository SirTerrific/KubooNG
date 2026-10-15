import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Book, Login, ScaleType } from '../../types'
import { ApiService } from '../../services/api'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Columns,
  Square,
  Maximize,
  Minimize,
  Heart,
  Bookmark,
  Sparkles,
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react'

interface ComicReaderProps {
  book: Book
  initialPage?: number
  activeLogin: Login
  defaultDualPane?: boolean
  defaultMangaRtl?: boolean
  defaultScaleType?: ScaleType
  onClose: () => void
  onSaveProgress: (book: Book, page: number) => void
  onToggleFavorite: (book: Book) => void
  onOpenNextBook?: (book: Book) => void
}

export const ComicReader: React.FC<ComicReaderProps> = ({
  book,
  initialPage = 0,
  activeLogin,
  defaultDualPane = false,
  defaultMangaRtl = false,
  defaultScaleType = ScaleType.ASPECT_FIT,
  onClose,
  onSaveProgress,
  onToggleFavorite,
  onOpenNextBook
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [dualPane, setDualPane] = useState(defaultDualPane)
  const [mangaRtl, setMangaRtl] = useState(defaultMangaRtl)
  const [scaleType, setScaleType] = useState<ScaleType>(defaultScaleType)
  const [showOverlay, setShowOverlay] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showBookInfo, setShowBookInfo] = useState(false)

  const totalPages = Math.max(1, book.totalPages || book.pages?.length || 1)
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-hide overlay after 4 seconds of inactivity
  const resetOverlayTimer = useCallback(() => {
    setShowOverlay(true)
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current)
    overlayTimeoutRef.current = setTimeout(() => {
      setShowOverlay(false)
    }, 4500)
  }, [])

  useEffect(() => {
    resetOverlayTimer()
    return () => {
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current)
    }
  }, [resetOverlayTimer])

  // Save progress on page change
  useEffect(() => {
    onSaveProgress(book, currentPage)
    ApiService.sendBookmark(book, currentPage, activeLogin)
  }, [currentPage, book, activeLogin, onSaveProgress])

  // Turn page logic (handles dual pane increment and manga RTL)
  const nextPage = useCallback(() => {
    setCurrentPage(prev => {
      const step = dualPane ? 2 : 1
      const next = prev + step
      return next < totalPages ? next : prev
    })
    resetOverlayTimer()
  }, [dualPane, totalPages, resetOverlayTimer])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => {
      const step = dualPane ? 2 : 1
      const next = prev - step
      return next >= 0 ? next : 0
    })
    resetOverlayTimer()
  }, [dualPane, resetOverlayTimer])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (mangaRtl) prevPage()
        else nextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (mangaRtl) nextPage()
        else prevPage()
      } else if (e.key === 'f') {
        toggleFullscreen()
      } else if (e.key === 'm') {
        setMangaRtl(prev => !prev)
      } else if (e.key === 'd') {
        setDualPane(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPage, prevPage, mangaRtl, onClose])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Handle tap zones: Left 25% = Prev/Next, Center 50% = Toggle Overlay, Right 25% = Next/Prev
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    if (x < width * 0.25) {
      if (mangaRtl) nextPage()
      else prevPage()
    } else if (x > width * 0.75) {
      if (mangaRtl) prevPage()
      else nextPage()
    } else {
      setShowOverlay(prev => !prev)
    }
  }

  // Calculate pages to show
  const page1Index = currentPage
  const page2Index = dualPane && currentPage + 1 < totalPages ? currentPage + 1 : null

  // If Manga mode and Dual pane, swap display order (Japanese right-to-left spread)
  const leftPageNum = mangaRtl && page2Index !== null ? page2Index : page1Index
  const rightPageNum = mangaRtl && page2Index !== null ? page1Index : page2Index

  const getPageUrl = (pageNum: number) => {
    return ApiService.getPageUrl(book, pageNum, activeLogin, 1500)
  }

  // Scale classes
  const getImageScaleClass = () => {
    switch (scaleType) {
      case ScaleType.ASPECT_FILL:
        return 'w-full h-full object-cover'
      case ScaleType.FIT_WIDTH:
        return 'w-full h-auto object-contain'
      case ScaleType.ASPECT_FIT:
      default:
        return 'max-h-[100vh] max-w-full object-contain'
    }
  }

  const isAtLastPage = dualPane ? currentPage >= totalPages - 2 : currentPage >= totalPages - 1

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none cursor-default"
      onMouseMove={resetOverlayTimer}
    >
      {/* Top Overlay Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 transition-transform duration-300 ${
          showOverlay ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Reader (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base truncate drop-shadow">
                {book.title}
              </h2>
              <p className="text-xs text-kuboo-textMuted truncate">
                {book.author ? `${book.author} • ` : ''}Page {currentPage + 1} of {totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Dual Pane Toggle */}
            <button
              onClick={() => setDualPane(!dualPane)}
              className={`p-2 rounded-md transition-colors ${
                dualPane ? 'bg-kuboo-accent text-black font-bold' : 'hover:bg-white/20 text-white'
              }`}
              title={dualPane ? "Dual Pane Enabled" : "Single Pane"}
            >
              <Columns className="w-5 h-5" />
            </button>

            {/* Manga RTL Toggle */}
            <button
              onClick={() => setMangaRtl(!mangaRtl)}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                mangaRtl ? 'bg-kuboo-accent text-black' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Toggle Right-to-Left Manga Reading Mode"
            >
              {mangaRtl ? "RTL (Manga)" : "LTR (Standard)"}
            </button>

            {/* Fit mode toggle */}
            <button
              onClick={() => {
                setScaleType(prev => (prev === ScaleType.ASPECT_FIT ? ScaleType.FIT_WIDTH : prev === ScaleType.FIT_WIDTH ? ScaleType.ASPECT_FILL : ScaleType.ASPECT_FIT))
              }}
              className="px-2 py-1 text-xs rounded-md bg-white/10 hover:bg-white/20 text-white font-mono hidden sm:block"
              title="Change aspect scaling"
            >
              {scaleType === ScaleType.ASPECT_FIT ? "Fit Screen" : scaleType === ScaleType.FIT_WIDTH ? "Fit Width" : "Fill"}
            </button>

            {/* Book info button */}
            <button
              onClick={() => setShowBookInfo(!showBookInfo)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              title="Book Information"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(book)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              title="Favorite"
            >
              <Heart className={`w-5 h-5 ${book.isFavorite ? 'fill-kuboo-accent text-kuboo-accent' : ''}`} />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors hidden sm:block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Comic Pages Stage */}
      <div
        className="flex-1 flex items-center justify-center overflow-auto relative w-full h-full"
        onClick={handleContentClick}
      >
        <div className={`flex items-center justify-center w-full h-full ${dualPane ? 'gap-1' : ''}`}>
          {/* Left Page (or single page) */}
          <div className="flex-1 flex items-center justify-center h-full max-w-full">
            <img
              src={getPageUrl(leftPageNum)}
              alt={`Page ${leftPageNum + 1}`}
              className={getImageScaleClass()}
              loading="eager"
            />
          </div>

          {/* Right Page (if dual pane) */}
          {dualPane && rightPageNum !== null && (
            <div className="flex-1 flex items-center justify-center h-full max-w-full">
              <img
                src={getPageUrl(rightPageNum)}
                alt={`Page ${rightPageNum + 1}`}
                className={getImageScaleClass()}
                loading="eager"
              />
            </div>
          )}
        </div>

        {/* End of book prompt card */}
        {isAtLastPage && (
          <div className="absolute bottom-28 inset-x-4 max-w-md mx-auto p-4 rounded-xl bg-[#212121]/95 border border-kuboo-accent shadow-2xl text-center pointer-events-auto backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-kuboo-accent mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Reached the End</h3>
            <p className="text-xs text-kuboo-textMuted mb-3">
              You finished reading {book.title}.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage(0)}
                className="px-3 py-1.5 rounded-md bg-[#333333] hover:bg-[#444444] text-xs font-semibold text-white"
              >
                Read Again
              </button>
              {book.linkNext && onOpenNextBook && (
                <button
                  onClick={() => onOpenNextBook(book)}
                  className="px-4 py-1.5 rounded-md bg-kuboo-accent text-black text-xs font-bold hover:bg-kuboo-accentLight flex items-center gap-1.5"
                >
                  Next Issue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Overlay Bar & Scrubber Slider */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pb-6 transition-transform duration-300 ${
          showOverlay ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Scrubber slider */}
          <div className="flex items-center gap-3 text-xs text-white">
            <button
              onClick={mangaRtl ? nextPage : prevPage}
              disabled={currentPage <= 0}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs w-10 text-right">
              {currentPage + 1}
            </span>

            <input
              type="range"
              min="0"
              max={totalPages - 1}
              value={currentPage}
              onChange={e => setCurrentPage(parseInt(e.target.value, 10))}
              className="flex-1 accent-[#FF5252] h-1.5 bg-[#3a3a3a] rounded-lg cursor-pointer"
            />

            <span className="font-mono text-xs w-10 text-left text-kuboo-textMuted">
              {totalPages}
            </span>

            <button
              onClick={mangaRtl ? prevPage : nextPage}
              disabled={currentPage >= totalPages - 1}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick chapter / page info */}
          <div className="flex items-center justify-between text-xs text-kuboo-textMuted px-1">
            <span>
              {mangaRtl ? "Manga (Right-to-Left)" : "Standard (Left-to-Right)"}
            </span>
            <span className="text-white font-medium">
              Page {currentPage + 1} {dualPane && page2Index !== null ? `& ${page2Index + 1}` : ''} of {totalPages}
            </span>
            <span>
              {dualPane ? "Dual Page Mode" : "Single Page Mode"}
            </span>
          </div>
        </div>
      </div>

      {/* Book Info Dialog */}
      {showBookInfo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{book.title}</h3>
              <button
                onClick={() => setShowBookInfo(false)}
                className="p-1 text-kuboo-textMuted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {book.author && (
              <p className="text-xs font-semibold text-kuboo-accent mb-2">
                By {book.author}
              </p>
            )}
            <p className="text-xs text-[#cccccc] mb-4 leading-relaxed max-h-48 overflow-y-auto">
              {book.content || 'No synopsis available for this volume.'}
            </p>
            <div className="bg-[#1c1c1c] p-3 rounded text-xs space-y-1 font-mono text-kuboo-textMuted mb-4">
              <div>Total Pages: {totalPages}</div>
              <div>Current Bookmark: Page {currentPage + 1}</div>
              <div>Server: {book.server}</div>
              <div>Format: {book.linkAcquisition?.split('.').pop()?.toUpperCase() || 'CBZ/IMAGE'}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowBookInfo(false)}
                className="px-4 py-2 bg-kuboo-accent text-black font-bold text-xs rounded hover:bg-kuboo-accentLight"
              >
                Continue Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
