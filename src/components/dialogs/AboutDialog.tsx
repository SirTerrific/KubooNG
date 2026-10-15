import React from 'react'
import { X, ExternalLink, Heart, BookOpen, Shield, Code2 } from 'lucide-react'

interface AboutDialogProps {
  onClose: () => void
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#353535]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5252] to-[#D32F2F] flex items-center justify-center text-white shadow">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Kuboo3</h3>
              <p className="text-xs text-kuboo-textMuted font-mono">v1.2.40 • Ubooquity 3.1.0 Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-kuboo-textMuted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm text-[#cccccc] leading-relaxed">
          <p>
            <strong>Kuboo3</strong> is an open-source, lightweight web application for reading comics and e-books hosted on <span className="text-kuboo-accent font-semibold">Ubooquity</span> servers via OPDS feeds.
          </p>

          <div className="bg-[#1c1c1c] p-3.5 rounded-lg border border-[#333333] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              Core Highlights &amp; Compatibility
            </div>
            <ul className="list-disc list-inside space-y-1 text-kuboo-textMuted">
              <li>Full support for Ubooquity 3 unified page stream (<code>/pagereader/</code>) and challenge HMAC-SHA256 session auth</li>
              <li>Single Pane, Dual Pane side-by-side spread, and Right-to-Left (RTL) Japanese manga reading mode</li>
              <li>Aspect Fit, Aspect Fill, and Fit Width scaling modes with live page scrubber</li>
              <li>Local .CBZ / .ZIP archive unzipping and in-browser offline reading storage</li>
              <li>OPDS folder hierarchy traversal with material badges and instant search</li>
            </ul>
          </div>

          <div className="border-t border-[#333333] pt-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Credits &amp; Open Source</h4>
            <p className="text-xs text-kuboo-textMuted">
              Originally authored by Seth Chhim (2019). Maintained and modernised for Ubooquity 3 by MenelikIII.
            </p>
            <p className="text-xs text-kuboo-textMuted">
              Licensed under the Apache License, Version 2.0.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="https://github.com/SirTerrific/Kuboo3"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#333333] hover:bg-[#404040] text-xs font-semibold text-white transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-kuboo-accent" />
              GitHub Repository
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>

            <a
              href="https://vaemendis.net/ubooquity/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#333333] hover:bg-[#404040] text-xs font-semibold text-white transition-colors"
            >
              Ubooquity Homepage
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-[#353535] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-kuboo-accent hover:bg-kuboo-accentLight text-black font-bold rounded text-xs transition-colors shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
