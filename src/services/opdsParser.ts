import { Book, Pagination } from '../types'

export class OpdsParser {
  static parse(xmlString: string, serverUrl: string): { books: Book[]; folders: Book[]; pagination: Pagination } {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

    const books: Book[] = []
    const folders: Book[] = []
    const pagination: Pagination = {
      currentPage: 1,
      totalPages: 1,
      firstUrl: '',
      lastUrl: '',
      nextUrl: '',
      previousUrl: ''
    }

    // Parse pagination links from feed level
    const feedLinks = xmlDoc.querySelectorAll('feed > link')
    feedLinks.forEach(link => {
      const rel = link.getAttribute('rel') || ''
      const href = link.getAttribute('href') || ''
      if (rel.toLowerCase() === 'next') pagination.nextUrl = href
      if (rel.toLowerCase() === 'previous') pagination.previousUrl = href
      if (rel.toLowerCase() === 'first') pagination.firstUrl = href
      if (rel.toLowerCase() === 'last') pagination.lastUrl = href
    })

    const entries = xmlDoc.querySelectorAll('entry')
    entries.forEach(entry => {
      const idStr = entry.querySelector('id')?.textContent?.trim() || '0'
      const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled'
      const author = entry.querySelector('author > name')?.textContent?.trim() || entry.querySelector('author')?.textContent?.trim() || ''
      const content = entry.querySelector('content')?.textContent?.trim() || ''

      let linkAcquisition = ''
      let linkSubsection = ''
      let linkThumbnail = ''
      let linkXmlPath = ''
      let linkPrevious = ''
      let linkNext = ''
      let linkPse = ''
      let totalPages = 0

      const links = entry.querySelectorAll('link')
      links.forEach(link => {
        const rel = (link.getAttribute('rel') || '').toLowerCase()
        const href = link.getAttribute('href') || ''
        const pseCount = link.getAttribute('pse:count')

        if (rel === 'http://opds-spec.org/acquisition') {
          linkAcquisition = href
        } else if (rel === 'subsection') {
          linkSubsection = href
        } else if (rel === 'http://opds-spec.org/image/thumbnail') {
          linkThumbnail = href
        } else if (rel === 'self') {
          linkXmlPath = href
        } else if (rel === 'previous') {
          linkPrevious = href
        } else if (rel === 'next') {
          linkNext = href
        } else if (rel === 'http://vaemendis.net/opds-pse/stream') {
          linkPse = href
          if (pseCount) {
            totalPages = parseInt(pseCount, 10) || 0
          }
        }
      })

      const isFolder = linkSubsection.length > 0 && linkAcquisition.length === 0 && linkPse.length === 0
      const parsedId = parseInt(idStr, 10) || Math.floor(Math.random() * 100000)

      const item: Book = {
        id: parsedId,
        title,
        author,
        content,
        linkAcquisition,
        linkSubsection,
        linkThumbnail,
        linkXmlPath,
        linkPrevious,
        linkNext,
        linkPse,
        currentPage: 0,
        totalPages,
        server: serverUrl
      }

      if (isFolder) {
        folders.push(item)
      } else {
        books.push(item)
      }
    })

    return { books, folders, pagination }
  }
}
