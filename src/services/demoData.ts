import { Book, Login } from '../types'

export const DEMO_SERVER: Login = {
  id: 1,
  nickname: 'Demo Library (Built-in)',
  server: 'https://demo.ubooquity.local/opds/',
  username: 'demo_user',
  password: 'demo_password',
  timeAccessed: Date.now()
}

// Sample comic pages using high quality SVG illustrations for seamless reading test
function createSvgComicPage(title: string, pageNum: number, total: number, theme: 'action' | 'adventure' | 'manga' | 'cyber'): string {
  const colors = {
    action: { bg: '#1a1016', border: '#e91e63', panel: '#2a1b24', accent: '#ff4081', text: '#ffebee' },
    adventure: { bg: '#0d1f2d', border: '#00bcd4', panel: '#1d2d44', accent: '#4dd0e1', text: '#e0f7fa' },
    manga: { bg: '#121212', border: '#757575', panel: '#1e1e1e', accent: '#e0e0e0', text: '#ffffff' },
    cyber: { bg: '#0b0f19', border: '#7c4dff', panel: '#151b2e', accent: '#b388ff', text: '#ede7f6' }
  }[theme]

  const isCover = pageNum === 1
  const isLast = pageNum === total

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
    <defs>
      <linearGradient id="grad-${pageNum}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.bg}" />
        <stop offset="100%" stop-color="${colors.panel}" />
      </linearGradient>
      <pattern id="halftone-${pageNum}" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="${colors.accent}" opacity="0.15" />
      </pattern>
    </defs>

    <!-- Page Background -->
    <rect width="800" height="1200" fill="url(#grad-${pageNum})" />
    <rect width="800" height="1200" fill="url(#halftone-${pageNum})" />

    <!-- Outer Border -->
    <rect x="25" y="25" width="750" height="1150" fill="none" stroke="${colors.border}" stroke-width="4" rx="8" />

    <!-- Header bar -->
    <rect x="40" y="45" width="720" height="40" fill="${colors.panel}" rx="6" />
    <text x="60" y="70" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="${colors.accent}" letter-spacing="1.5">
      ${title.toUpperCase()}
    </text>
    <text x="730" y="70" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="${colors.text}" opacity="0.8">
      PAGE ${pageNum} / ${total}
    </text>

    ${isCover ? `
      <!-- Cover art layout -->
      <rect x="50" y="110" width="700" height="600" fill="${colors.panel}" rx="8" stroke="${colors.accent}" stroke-width="2" />
      <circle cx="400" cy="410" r="180" fill="${colors.border}" opacity="0.2" />
      <polygon points="400,280 460,460 340,460" fill="${colors.accent}" opacity="0.8" />
      <circle cx="400" cy="380" r="40" fill="#ffffff" />
      
      <text x="400" y="780" text-anchor="middle" font-family="system-ui, sans-serif" font-size="42" font-weight="900" fill="#ffffff" letter-spacing="2">
        ${title}
      </text>
      <text x="400" y="830" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="${colors.accent}">
        SPECIAL COLLECTOR'S EDITION
      </text>

      <rect x="150" y="900" width="500" height="180" fill="${colors.panel}" rx="8" stroke="${colors.border}" stroke-width="1.5" />
      <text x="400" y="950" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="${colors.text}">
        Kuboo3 OPDS Reader Demo Content
      </text>
      <text x="400" y="985" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="${colors.text}" opacity="0.7">
        Supports Single Pane, Dual Pane &amp; Manga RTL Mode
      </text>
      <text x="400" y="1030" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="${colors.accent}">
        Turn page or swipe to continue reading &rarr;
      </text>
    ` : isLast ? `
      <!-- End of book page -->
      <rect x="60" y="120" width="680" height="980" fill="${colors.panel}" rx="12" stroke="${colors.accent}" stroke-width="2" />
      <text x="400" y="450" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="${colors.accent}">
        TO BE CONTINUED...
      </text>
      <text x="400" y="520" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="${colors.text}">
        End of ${title}
      </text>
      <rect x="250" y="580" width="300" height="50" fill="${colors.accent}" rx="25" />
      <text x="400" y="612" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#000000">
        COMPLETED
      </text>
    ` : `
      <!-- Multi-panel comic page layout -->
      <!-- Panel 1 (Top wide) -->
      <rect x="50" y="110" width="700" height="300" fill="${colors.panel}" rx="6" stroke="${colors.border}" stroke-width="2" />
      <path d="M70,360 L200,200 L320,310 L450,180 L650,380" fill="none" stroke="${colors.accent}" stroke-width="3" opacity="0.4"/>
      <circle cx="200" cy="200" r="16" fill="${colors.accent}" />
      <!-- Dialogue Bubble -->
      <rect x="90" y="140" width="260" height="70" rx="14" fill="#ffffff" />
      <polygon points="140,210 160,210 130,235" fill="#ffffff" />
      <text x="110" y="170" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111111">
        We've arrived at the outpost.
      </text>
      <text x="110" y="192" font-family="system-ui, sans-serif" font-size="13" fill="#333333">
        Prepare the navigational systems!
      </text>

      <!-- Panel 2 (Middle Left) -->
      <rect x="50" y="430" width="335" height="330" fill="${colors.panel}" rx="6" stroke="${colors.border}" stroke-width="2" />
      <circle cx="215" cy="580" r="70" fill="${colors.border}" opacity="0.3" />
      <rect x="180" y="530" width="70" height="90" rx="6" fill="${colors.accent}" opacity="0.7" />
      <rect x="70" y="450" width="220" height="60" rx="12" fill="#ffffff" />
      <polygon points="160,510 180,510 170,528" fill="#ffffff" />
      <text x="85" y="475" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#111">
        Signal is locked on.
      </text>
      <text x="85" y="495" font-family="system-ui, sans-serif" font-size="12" fill="#444">
        Downloading chapter archives...
      </text>

      <!-- Panel 3 (Middle Right) -->
      <rect x="415" y="430" width="335" height="330" fill="${colors.panel}" rx="6" stroke="${colors.border}" stroke-width="2" />
      <path d="M440,700 Q580,500 720,700" fill="none" stroke="${colors.accent}" stroke-width="4" />
      <rect x="440" y="460" width="240" height="55" rx="12" fill="#ffffff" />
      <polygon points="520,515 540,515 550,535" fill="#ffffff" />
      <text x="455" y="485" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#111">
        "Look at that horizon!"
      </text>
      <text x="455" y="503" font-family="system-ui, sans-serif" font-size="12" fill="#444">
        Everything matches the ancient map.
      </text>

      <!-- Panel 4 (Bottom Full Width) -->
      <rect x="50" y="780" width="700" height="340" fill="${colors.panel}" rx="6" stroke="${colors.border}" stroke-width="2" />
      <circle cx="400" cy="950" r="100" fill="${colors.border}" opacity="0.2" />
      <rect x="360" y="900" width="80" height="80" fill="${colors.accent}" rx="8" />
      <rect x="90" y="810" width="380" height="50" rx="10" fill="#ffffff" />
      <polygon points="360,860 380,860 390,885" fill="#ffffff" />
      <text x="110" y="842" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#111">
        Let's continue onward. The next zone awaits!
      </text>
    `}

    <!-- Footer Page Indicator -->
    <text x="400" y="1155" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="${colors.text}" opacity="0.6">
      - ${pageNum} -
    </text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function generateComicPages(title: string, count: number, theme: 'action' | 'adventure' | 'manga' | 'cyber'): string[] {
  const pages: string[] = []
  for (let i = 1; i <= count; i++) {
    pages.push(createSvgComicPage(title, i, count, theme))
  }
  return pages
}

export const DEMO_BOOKS: Book[] = [
  {
    id: 101,
    title: 'Pepper & Carrot: The Potion Contest #01',
    author: 'David Revoy',
    content: 'Pepper and her cat Carrot enter the famous Komona Potion Contest. A classic open-source comic adventure featuring delightful magic, mishaps, and high resolution comic art.',
    linkAcquisition: '/opds-comics/pepper_carrot_01.cbz',
    linkSubsection: '',
    linkThumbnail: createSvgComicPage('Pepper & Carrot #01', 1, 14, 'adventure'),
    linkXmlPath: '/opds/comicreader/101',
    linkPrevious: '',
    linkNext: '/opds/comicreader/102',
    linkPse: '/pagereader/101?page={pageNumber}&width={maxWidth}',
    currentPage: 0,
    totalPages: 14,
    server: DEMO_SERVER.server,
    isFavorite: true,
    isFinished: false,
    timeAccessed: Date.now() - 3600 * 1000,
    pages: generateComicPages('Pepper & Carrot #01', 14, 'adventure')
  },
  {
    id: 102,
    title: 'Neon Odyssey: Cyberpunk Chronicles #02',
    author: 'S. Tanaka & R. Sterling',
    content: 'In the towering megastructures of Neo-Kyoto, a data courier discovers an encrypted quantum drive containing the missing blueprints to the orbital station.',
    linkAcquisition: '/opds-comics/neon_odyssey_02.cbz',
    linkSubsection: '',
    linkThumbnail: createSvgComicPage('Neon Odyssey #02', 1, 18, 'cyber'),
    linkXmlPath: '/opds/comicreader/102',
    linkPrevious: '/opds/comicreader/101',
    linkNext: '/opds/comicreader/103',
    linkPse: '/pagereader/102?page={pageNumber}&width={maxWidth}',
    currentPage: 4,
    totalPages: 18,
    server: DEMO_SERVER.server,
    isFavorite: true,
    isFinished: false,
    timeAccessed: Date.now() - 7200 * 1000,
    pages: generateComicPages('Neon Odyssey #02', 18, 'cyber')
  },
  {
    id: 103,
    title: 'Shinobi Shadow: Manga Volume 1',
    author: 'Kenji Sato',
    content: 'Right-to-Left format manga series following a rogue ninja in feudal Japan uncovering a shadow clan syndicate. Perfect for testing Manga RTL reading mode!',
    linkAcquisition: '/opds-comics/shinobi_shadow_v1.cbz',
    linkSubsection: '',
    linkThumbnail: createSvgComicPage('Shinobi Shadow V1', 1, 24, 'manga'),
    linkXmlPath: '/opds/comicreader/103',
    linkPrevious: '/opds/comicreader/102',
    linkNext: '/opds/comicreader/104',
    linkPse: '/pagereader/103?page={pageNumber}&width={maxWidth}',
    currentPage: 0,
    totalPages: 24,
    server: DEMO_SERVER.server,
    isFavorite: false,
    isFinished: false,
    timeAccessed: Date.now() - 86400 * 1000,
    pages: generateComicPages('Shinobi Shadow V1', 24, 'manga')
  },
  {
    id: 104,
    title: 'Vanguard Squadron: Galactic Vanguard #05',
    author: 'Elena Rostova',
    content: 'Interstellar fighter pilots defending Deep Space Station Alpha from an armada of rogue automated dreadnoughts.',
    linkAcquisition: '/opds-comics/vanguard_squadron_05.cbr',
    linkSubsection: '',
    linkThumbnail: createSvgComicPage('Vanguard Squadron #05', 1, 16, 'action'),
    linkXmlPath: '/opds/comicreader/104',
    linkPrevious: '/opds/comicreader/103',
    linkNext: '/opds/comicreader/105',
    linkPse: '/pagereader/104?page={pageNumber}&width={maxWidth}',
    currentPage: 16,
    totalPages: 16,
    server: DEMO_SERVER.server,
    isFavorite: false,
    isFinished: true,
    timeAccessed: Date.now() - 120000 * 1000,
    pages: generateComicPages('Vanguard Squadron #05', 16, 'action')
  },
  {
    id: 105,
    title: 'The Time Machine',
    author: 'H. G. Wells',
    content: 'The classic science fiction novella about an English Victorian scientist and inventor who travels into the far future year 802,701 AD.',
    linkAcquisition: '/opds-books/time_machine.epub',
    linkSubsection: '',
    linkThumbnail: createSvgComicPage('The Time Machine', 1, 12, 'adventure'),
    linkXmlPath: '/opds/bookreader/105',
    linkPrevious: '/opds/comicreader/104',
    linkNext: '',
    linkPse: '/pagereader/105?page={pageNumber}&width={maxWidth}',
    currentPage: 2,
    totalPages: 12,
    server: DEMO_SERVER.server,
    isFavorite: true,
    isFinished: false,
    timeAccessed: Date.now() - 150000 * 1000,
    pages: generateComicPages('The Time Machine', 12, 'adventure')
  }
]

export const DEMO_FOLDERS = [
  {
    id: 1,
    title: 'Comics Collection (DC & Marvel & Indie)',
    author: 'Folder',
    content: 'Collection of digitized Western comics and graphic novels',
    linkAcquisition: '',
    linkSubsection: '/opds-comics/',
    linkThumbnail: '',
    linkXmlPath: '/opds/comics',
    linkPrevious: '',
    linkNext: '',
    linkPse: '',
    currentPage: 0,
    totalPages: 4,
    server: DEMO_SERVER.server
  },
  {
    id: 2,
    title: 'Manga & Manhwa Library',
    author: 'Folder',
    content: 'Japanese and Korean serialized titles with RTL manga pagination support',
    linkAcquisition: '',
    linkSubsection: '/opds-manga/',
    linkThumbnail: '',
    linkXmlPath: '/opds/manga',
    linkPrevious: '',
    linkNext: '',
    linkPse: '',
    currentPage: 0,
    totalPages: 1,
    server: DEMO_SERVER.server
  },
  {
    id: 3,
    title: 'E-Books & Literature (EPUB / PDF)',
    author: 'Folder',
    content: 'Novels, technical books and illustrated PDF volumes',
    linkAcquisition: '',
    linkSubsection: '/opds-books/',
    linkThumbnail: '',
    linkXmlPath: '/opds/books',
    linkPrevious: '',
    linkNext: '',
    linkPse: '',
    currentPage: 0,
    totalPages: 1,
    server: DEMO_SERVER.server
  }
]
