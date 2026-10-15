import React from 'react'
import { Book, Login, Pagination } from '../../types'
import { ApiService } from '../../services/api'
import { Folder, ChevronRight, Home, Download, Heart, BookOpen, FileText, Check, AlertCircle } from 'lucide-react'

interface PathItem {
  name: string
  url: string
}

interface BrowserViewProps {
  activeLogin: Login
  folders: Book[]
  books: Book[]
  pathHistory: PathItem[]
  pagination: Pagination
  isGridView: boolean
  isLoading: boolean
  error: string | null
  onOpenFolder: (folder: Book) => void
  onNavigatePath: (index: number) => void
  onOpenBook: (book: Book) => void
  onToggleFavorite: (book: Book) => void
  onDownloadBook: (book: Book) => void
  onPageChange: (direction: 'next' | 'previous') => void
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  activeLogin,
  folders,
  books,
  pathHistory,
  pagination,
  isGridView,
  isLoading,
  error,
  onOpenFolder,
  onNavigatePath,
  onOpenBook,
  onToggleFavorite,
  onDownloadBook,
  onPageChange
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Path Breadcrumbs Bar (Matching Kuboo BrowserPathAdapter) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 text-xs no-scrollbar border-b border-[#333333]">
        <button
          onClick={() => onNavigatePath(0)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#2a2a2a] hover:bg-[#353535] text-white flex-shrink-0 transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-kuboo-accent" />
          <span>Library Root</span>
        </button>

        {pathHistory.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-kuboo-textMuted flex-shrink-0" />
            <button
              onClick={() => onNavigatePath(idx + 1)}
              className={`px-2.5 py-1.5 rounded-md text-xs flex-shrink-0 transition-colors ${
                idx === pathHistory.length - 1
                  ? 'bg-kuboo-accent text-black font-semibold'
                  : 'bg-[#2a2a2a] hover:bg-[#353535] text-white'
              }`}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-kuboo-textMuted">
          <div className="w-10 h-10 border-3 border-kuboo-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Connecting to {activeLogin.nickname}...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-6 rounded-lg bg-red-950/40 border border-red-800/60 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white mb-1">Failed to Load Feed</h4>
          <p className="text-xs text-red-200 mb-4">{error}</p>
          <p className="text-xs text-kuboo-textMuted">
            Verify server URL (e.g. http://192.168.0.x:2202/opds/) or switch to the built-in Demo Library in Settings.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Folders List (Matching browser_item_content_folder.xml with MaterialBadge) */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-kuboo-textMuted mb-3">
                Folders ({folders.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => onOpenFolder(folder)}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] border border-[#353535] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#303030] group-hover:bg-kuboo-accent/20 flex items-center justify-center text-kuboo-accent transition-colors flex-shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-kuboo-accent transition-colors">
                          {folder.title}
                        </h4>
                        <p className="text-xs text-kuboo-textMuted truncate">
                          {folder.content || 'Browse section'}
                        </p>
                      </div>
                    </div>
                    {folder.totalPages > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-[#333333] group-hover:bg-kuboo-accent group-hover:text-black text-white text-xs font-bold transition-colors">
                        {folder.totalPages}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Books / Media List (Grid or List based on isGridView) */}
          {books.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-kuboo-textMuted">
                  Comics &amp; Books ({books.length})
                </h3>
              </div>

              {isGridView ? (
                /* Grid View */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {books.map(book => (
                    <div
                      key={book.id}
                      onClick={() => onOpenBook(book)}
                      className="group bg-[#242424] hover:bg-[#2c2c2c] border border-[#353535] rounded-lg p-2.5 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between"
                    >
                      <div className="relative aspect-2/3 w-full rounded overflow-hidden mb-2 bg-[#181818]">
                        <img
                          src={ApiService.getCoverUrl(book, activeLogin, 350)}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                          loading="lazy"
                        />
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleFavorite(book)
                            }}
                            className="p-1 rounded-full bg-black/60 text-white hover:text-kuboo-accent transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-kuboo-accent text-kuboo-accent' : ''}`} />
                          </button>
                        </div>
                        {book.totalPages > 0 && (
                          <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                            {book.totalPages}p
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-kuboo-accent transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-kuboo-textMuted truncate mt-0.5">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View (Matching browser_item_content_media_force_list.xml) */
                <div className="space-y-2">
                  {books.map(book => (
                    <div
                      key={book.id}
                      onClick={() => onOpenBook(book)}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#242424] hover:bg-[#2c2c2c] border border-[#353535] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={ApiService.getCoverUrl(book, activeLogin, 150)}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded shadow-xs flex-shrink-0 bg-[#181818]"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-kuboo-accent transition-colors">
                            {book.title}
                          </h4>
                          <p className="text-xs text-kuboo-textMuted truncate">
                            {book.author || 'Unknown Author'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#333333] text-[#bbbbbb] rounded font-mono">
                              {book.linkAcquisition?.endsWith('.epub') ? 'EPUB' : book.linkAcquisition?.endsWith('.pdf') ? 'PDF' : 'CBZ'}
                            </span>
                            {book.totalPages > 0 && (
                              <span className="text-[10px] text-kuboo-textMuted">
                                {book.totalPages} pages
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDownloadBook(book)
                          }}
                          className="p-2 rounded-md hover:bg-[#383838] text-kuboo-textMuted hover:text-white transition-colors"
                          title="Save for offline"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(book)
                          }}
                          className="p-2 rounded-md hover:bg-[#383838] text-kuboo-textMuted hover:text-white transition-colors"
                          title="Toggle favorite"
                        >
                          <Heart className={`w-4 h-4 ${book.isFavorite ? 'fill-kuboo-accent text-kuboo-accent' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-16 text-kuboo-textMuted">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No comics or subfolders found in this directory</p>
            </div>
          ) : null}

          {/* Pagination Controls (browser_layout_pagination.xml) */}
          {(pagination.nextUrl || pagination.previousUrl) && (
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-[#333333]">
              <button
                disabled={!pagination.previousUrl}
                onClick={() => onPageChange('previous')}
                className={`px-4 py-2 rounded-md text-xs font-semibold ${
                  pagination.previousUrl
                    ? 'bg-[#333333] hover:bg-[#404040] text-white cursor-pointer'
                    : 'bg-[#222222] text-[#666666] cursor-not-allowed'
                }`}
              >
                &larr; Previous Page
              </button>
              <span className="text-xs text-kuboo-textMuted font-mono">
                Page {pagination.currentPage}
              </span>
              <button
                disabled={!pagination.nextUrl}
                onClick={() => onPageChange('next')}
                className={`px-4 py-2 rounded-md text-xs font-semibold ${
                  pagination.nextUrl
                    ? 'bg-[#333333] hover:bg-[#404040] text-white cursor-pointer'
                    : 'bg-[#222222] text-[#666666] cursor-not-allowed'
                }`}
              >
                Next Page &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
