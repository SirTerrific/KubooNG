# Kuboo3 (React Web Edition)

A modern, high-performance web client for [Ubooquity](https://vaemendis.net/ubooquity/) servers and OPDS comic/book libraries, rewritten as a full-featured React + TypeScript SPA with Express proxy backend. Originally based on the Android client by Seth Chhim and the Ubooquity 3 fork by MenelikIII.

---

## Features

### 📖 High-Performance Comic & Book Reader
- **Single & Dual Pane Spreads**: Read individual pages or view side-by-side two-page spreads.
- **Manga RTL Mode**: True Right-to-Left page order and navigation designed for Japanese manga.
- **Scaling Modes**:
  - **Aspect Fit**: Letterboxes full page within view without scrolling.
  - **Aspect Fill**: Maximizes image to fill viewport.
  - **Fit Width**: Adapts to screen width with smooth vertical scrolling for webtoons and long strips.
- **Interactive Scrubber Slider**: Real-time page scrub with live page numbering (*"Page X of Y"*).
- **Auto-Bookmark Synchronization**: Automatically records reading progress locally and syncs to Ubooquity's `/user-api/bookmark` endpoint.
- **Touch & Keyboard Controls**: Tap navigation zones, Arrow keys, Space, Fullscreen (`F`), Manga toggle (`M`), Dual pane (`D`), and Esc to close.

### 🗂️ Catalog & OPDS Feed Browser
- **Hierarchical Path Breadcrumbs**: Navigate deep folder structures with clickable breadcrumb trail.
- **Material Badges**: Folder item counts displayed on directory cards.
- **Grid & List Views**: Instant toggle between visual cover grid and detailed list view with file formats (`CBZ`, `CBR`, `EPUB`, `PDF`).
- **Live Search**: Instant keyword query filtering directly against OPDS search parameters.
- **OPDS Pagination**: Seamless navigation across server catalog pages.

### 💾 Offline Downloads & Local Archive Importer
- **Offline Reading**: Save comics directly into browser local storage for reading on the go.
- **Local .CBZ / .ZIP Unpacker**: Drag-and-drop or upload local `.cbz` and `.zip` comic files — automatically decompressed in-browser for zero-server reading.

### 🌐 Complete Ubooquity 2 & 3 Support
- **Ubooquity 3 Page Streaming**: Direct page streaming via `/pagereader/{id}?page={n}&width={w}` with automatic cover scaling.
- **Ubooquity 3 Challenge Session Auth**: Built-in `hmac_sha256(hmac_sha256(password, serversalt), servertime)` handshake handling session cookies.
- **CORS & Mixed-Content Bypass**: Built-in Express server proxy handles plain HTTP LAN server connections securely.

### 🎨 Authentic Dark & OLED Themes
- **Dark Theme**: Charcoal `#212121` with signature `#FF5252` accent.
- **OLED Black**: Pitch black `#000000` for OLED displays with crisp contrast.
- **Customizable Home Layout**: Choose between Recently Viewed, Latest Releases, or both.

---

## Getting Started

### Development
```bash
npm install
npm run dev
```
Starts the full-stack server on `http://0.0.0.0:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons, JSZip.
- **Backend / Proxy**: Express, Node.js Crypto (HMAC SHA-256 for Ubooquity 3 challenge handshake), Vite dev middleware.
- **Storage**: Browser LocalStorage & in-memory cache for credentials, recents, bookmarks, and downloads.

---

## License

Licensed under the Apache License, Version 2.0.
Original Android application created by Seth Chhim. Ubooquity 3 fork by MenelikIII.
