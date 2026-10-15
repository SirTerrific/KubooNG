import React from 'react'
import { Book, Login, RecentItem, FavoriteItem, HomeLayout } from '../../types'
import { ApiService } from '../../services/api'
import { Play, Heart, BookOpen, Clock, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react'

interface HomeViewProps {
  activeLogin: Login
  recentItems: RecentItem[]
  favoriteItems: FavoriteItem[]
  latestBooks: Book[]
  homeLayout: HomeLayout
  onOpenBook: (book: Book, initialPage?: number) => void
  onToggleFavorite: (book: Book) => void
  onNavigateToBrowse: () => void
  isGridView: boolean
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeLogin,
  recentItems,
  favoriteItems,
  latestBooks,
  homeLayout,
  onOpenBook,
  onToggleFavorite,
  onNavigateToBrowse,
  isGridView
}) => {
  const mostRecent = recentItems[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 pb-24">
      {/* Hero Continue Reading Card */}
      {mostRecent ? (
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2a2a2a] to-[#202020] border border-[#3c3c3c] shadow-lg">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Book Cover */}
            <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => onOpenBook(mostRecent.book, mostRecent.currentPage)}>
              <img
                src={ApiService.getCoverUrl(mostRecent.book, activeLogin, 500)}
                alt={mostRecent.book.title}
                className="w-36 sm:w-44 h-52 sm:h-64 object-cover rounded-md shadow-md border border-[#444444] group-hover:scale-102 transition-transform"
                loading="eager"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                <div className="w-12 h-12 rounded-full bg-kuboo-accent text-black flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 fill-black ml-0.5" />
                </div>
              </div>
            </div>

            {/* Book Info & Continue Button */}
            <div className="flex-1 flex flex-col justify-between h-full text-center sm:text-left min-w-0 w-full">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-kuboo-accent/20 text-kuboo-accentLight text-xs font-semibold mb-2">
                  <Clock className="w-3 h-3" />
                  Continue Reading
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate leading-tight">
                  {mostRecent.book.title}
                </h2>
                {mostRecent.book.author && (
                  <p className="text-sm text-kuboo-textMuted mt-1">
                    {mostRecent.book.author}
                  </p>
                )}
                {mostRecent.book.content && (
                  <p className="text-xs sm:text-sm text-[#aaaaaa] mt-3 line-clamp-3 leading-relaxed">
                    {mostRecent.book.content}
                  </p>
                )}
              </div>

              {/* Progress Bar & Actions */}
              <div className="mt-6 pt-4 border-t border-[#333333]">
                <div className="flex items-center justify-between text-xs text-kuboo-textMuted mb-2">
                  <span>Page {mostRecent.currentPage + 1} of {mostRecent.totalPages || mostRecent.book.totalPages || '?'}</span>
                  <span>
                    {mostRecent.totalPages
                      ? `${Math.round(((mostRecent.currentPage + 1) / mostRecent.totalPages) * 100)}%`
                      : ''}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-kuboo-accent rounded-full transition-all"
                    style={{
                      width: `${mostRecent.totalPages ? Math.min(100, Math.round(((mostRecent.currentPage + 1) / mostRecent.totalPages) * 100)) : 0}%`
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => onOpenBook(mostRecent.book, mostRecent.currentPage)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-kuboo-accent hover:bg-kuboo-accentLight text-black font-semibold text-sm transition-all shadow-md active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    Resume Reading
                  </button>

                  <button
                    onClick={() => onToggleFavorite(mostRecent.book)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#333333] hover:bg-[#404040] text-white text-sm transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${mostRecent.book.isFavorite ? 'fill-kuboo-accent text-kuboo-accent' : 'text-kuboo-textMuted'}`} />
                    {mostRecent.book.isFavorite ? 'Favorited' : 'Favorite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="p-8 rounded-xl bg-[#242424] border border-[#383838] text-center">
          <BookOpen className="w-12 h-12 text-kuboo-accent mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white mb-1">Welcome to Kuboo3</h3>
          <p className="text-sm text-kuboo-textMuted max-w-md mx-auto mb-4">
            Select a comic or book from the browse tab to start reading with single/dual pane and manga mode.
          </p>
          <button
            onClick={onNavigateToBrowse}
            className="inline-flex items-center gap-2 px-4 py-2 bg-kuboo-accent text-black font-semibold rounded-md text-sm hover:bg-kuboo-accentLight transition-colors"
          >
            Browse Library
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Recently Viewed Section (if homeLayout allows) */}
      {(homeLayout === HomeLayout.RECENTLY_VIEWED_ONLY || homeLayout === HomeLayout.BOTH) && recentItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-kuboo-accent" />
              <h3 className="text-lg font-bold text-white">Recently Viewed</h3>
            </div>
            <span className="text-xs text-kuboo-textMuted">{recentItems.length} titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentItems.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenBook(item.book, item.currentPage)}
                className="group bg-[#242424] hover:bg-[#2c2c2c] border border-[#353535] rounded-lg p-2.5 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between"
              >
                <div className="relative aspect-2/3 w-full rounded overflow-hidden mb-2 bg-[#181818]">
                  <img
                    src={ApiService.getCoverUrl(item.book, activeLogin, 350)}
                    alt={item.book.title}
                    className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                    loading="lazy"
                  />
                  {item.book.isFinished && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      FINISHED
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-kuboo-accent rounded-full"
                        style={{
                          width: `${item.totalPages ? Math.min(100, Math.round(((item.currentPage + 1) / item.totalPages) * 100)) : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-kuboo-accent transition-colors">
                    {item.book.title}
                  </h4>
                  <p className="text-[11px] text-kuboo-textMuted truncate mt-0.5">
                    Page {item.currentPage + 1} / {item.totalPages || item.book.totalPages || '?'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest / Discover Section (if homeLayout allows) */}
      {(homeLayout === HomeLayout.LATEST_ONLY || homeLayout === HomeLayout.BOTH) && latestBooks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-kuboo-accent" />
              <h3 className="text-lg font-bold text-white">Latest in Library</h3>
            </div>
            <button
              onClick={onNavigateToBrowse}
              className="text-xs text-kuboo-accent hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {latestBooks.slice(0, 10).map(book => (
              <div
                key={book.id}
                onClick={() => onOpenBook(book, 0)}
                className="group bg-[#242424] hover:bg-[#2c2c2c] border border-[#353535] rounded-lg p-2.5 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between"
              >
                <div className="relative aspect-2/3 w-full rounded overflow-hidden mb-2 bg-[#181818]">
                  <img
                    src={ApiService.getCoverUrl(book, activeLogin, 350)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(book)
                    }}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:text-kuboo-accent transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-kuboo-accent text-kuboo-accent' : ''}`} />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-kuboo-accent transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-kuboo-textMuted truncate mt-0.5">
                    {book.author || `${book.totalPages} pages`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Favorites Section */}
      {favoriteItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-kuboo-accent text-kuboo-accent" />
              <h3 className="text-lg font-bold text-white">Favorites</h3>
            </div>
            <span className="text-xs text-kuboo-textMuted">{favoriteItems.length} titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoriteItems.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenBook(item.book, 0)}
                className="group bg-[#242424] hover:bg-[#2c2c2c] border border-[#353535] rounded-lg p-2.5 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between"
              >
                <div className="relative aspect-2/3 w-full rounded overflow-hidden mb-2 bg-[#181818]">
                  <img
                    src={ApiService.getCoverUrl(item.book, activeLogin, 350)}
                    alt={item.book.title}
                    className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 right-1.5">
                    <Heart className="w-4 h-4 fill-kuboo-accent text-kuboo-accent drop-shadow" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-kuboo-accent transition-colors">
                    {item.book.title}
                  </h4>
                  <p className="text-[11px] text-kuboo-textMuted truncate mt-0.5">
                    {item.book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
