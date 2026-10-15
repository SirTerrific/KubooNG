import React, { useRef, useState } from 'react'
import { DownloadItem, Book, Login } from '../../types'
import { ApiService } from '../../services/api'
import { StorageService } from '../../services/storage'
import { Download, Trash2, BookOpen, HardDrive, Upload, CheckCircle2, Clock, Play, FileArchive } from 'lucide-react'
import JSZip from 'jszip'

interface DownloadsViewProps {
  downloads: DownloadItem[]
  activeLogin: Login
  onOpenBook: (book: Book, initialPage?: number) => void
  onDeleteDownload: (id: string) => void
  onImportLocalBook: (book: Book) => void
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  activeLogin,
  onOpenBook,
  onDeleteDownload,
  onImportLocalBook
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')

  // Handle local CBZ / ZIP file import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportStatus(`Unpacking ${file.name}...`)

    try {
      const zip = new JSZip()
      const loadedZip = await zip.loadAsync(file)

      // Find image files (.jpg, .jpeg, .png, .webp)
      const imageFiles: string[] = []
      loadedZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && /\.(jpe?g|png|webp|gif|bmp)$/i.test(relativePath)) {
          imageFiles.push(relativePath)
        }
      })

      // Natural sort image filenames
      imageFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

      if (imageFiles.length === 0) {
        throw new Error('No supported image pages found in archive.')
      }

      setImportStatus(`Loading ${imageFiles.length} pages...`)

      // Convert images to base64 data URLs
      const pages: string[] = []
      for (const imgPath of imageFiles) {
        const fileData = await loadedZip.file(imgPath)?.async('base64')
        if (fileData) {
          const ext = imgPath.split('.').pop()?.toLowerCase() || 'jpeg'
          const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
          pages.push(`data:${mime};base64,${fileData}`)
        }
      }

      const bookTitle = file.name.replace(/\.[^/.]+$/, '')
      const newBook: Book = {
        id: Math.floor(Math.random() * 100000) + 500,
        title: bookTitle,
        author: 'Local File Archive',
        content: `Imported local comic archive: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
        linkAcquisition: file.name,
        linkSubsection: '',
        linkThumbnail: pages[0] || '',
        linkXmlPath: '',
        linkPrevious: '',
        linkNext: '',
        linkPse: '',
        currentPage: 0,
        totalPages: pages.length,
        server: 'local://storage',
        filePath: file.name,
        pages
      }

      onImportLocalBook(newBook)
      setImportStatus('Archive successfully imported!')
      setTimeout(() => {
        setIsImporting(false)
        setImportStatus('')
      }, 1500)
    } catch (err: any) {
      alert(`Error loading comic archive: ${err.message}`)
      setIsImporting(false)
      setImportStatus('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header and Import button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#242424] border border-[#383838]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-kuboo-accent" />
            Downloaded &amp; Local Comics
          </h2>
          <p className="text-xs text-kuboo-textMuted mt-1">
            Read comics and books offline without an internet connection or import local .cbz archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".cbz,.zip,.cbr"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#333333] hover:bg-[#404040] text-white text-xs font-semibold rounded-md transition-colors"
          >
            <Upload className="w-4 h-4 text-kuboo-accent" />
            {isImporting ? importStatus : "Import .CBZ / .ZIP"}
          </button>
        </div>
      </div>

      {/* Downloads List */}
      {downloads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {downloads.map(item => (
            <div
              key={item.id}
              className="bg-[#242424] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg p-3 transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-16 h-24 rounded bg-[#181818] overflow-hidden flex-shrink-0 cursor-pointer relative"
                  onClick={() => onOpenBook(item.book)}
                >
                  <img
                    src={ApiService.getCoverUrl(item.book, activeLogin, 200)}
                    alt={item.book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 fill-white text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                    {item.book.title}
                  </h4>
                  <p className="text-xs text-kuboo-textMuted truncate mt-0.5">
                    {item.book.author || 'Downloaded volume'}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved Offline ({item.book.totalPages}p)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#333333] flex items-center justify-between">
                <button
                  onClick={() => onOpenBook(item.book)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-kuboo-accent hover:bg-kuboo-accentLight text-black text-xs font-bold transition-colors"
                >
                  <Play className="w-3 h-3 fill-black" />
                  Read Offline
                </button>

                <button
                  onClick={() => onDeleteDownload(item.id)}
                  className="p-1.5 text-kuboo-textMuted hover:text-red-400 rounded hover:bg-[#333333] transition-colors"
                  title="Remove download"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-xl bg-[#202020] border border-[#303030]">
          <FileArchive className="w-12 h-12 text-kuboo-textMuted mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white mb-1">No Downloaded Books Yet</h3>
          <p className="text-xs text-kuboo-textMuted max-w-sm mx-auto mb-4">
            You can download books from your Ubooquity server by clicking the download icon on any title, or import a local .cbz archive above.
          </p>
        </div>
      )}
    </div>
  )
}
