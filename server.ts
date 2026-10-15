import express, { Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import http from 'http'
import https from 'https'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// Cache of active Ubooquity session cookies keyed by server+username
const sessionCookieStore = new Map<string, { cookie: string; timestamp: number }>()

function hmacSha256(key: string, message: string): string {
  return crypto.createHmac('sha256', key).update(message).digest('hex')
}

function ubooquityLoginHash(password: string, salt: string, time: string): string {
  const inner = hmacSha256(password, salt)
  return hmacSha256(inner, time)
}

// Helper to authenticate with Ubooquity 3 if session cookie is missing
async function getOrAuthenticateSession(serverUrl: string, username?: string, password?: string): Promise<string | null> {
  if (!username || !password) return null
  const cacheKey = `${serverUrl}|${username}`
  const cached = sessionCookieStore.get(cacheKey)
  // Re-use session if less than 30 minutes old
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
    return cached.cookie
  }

  try {
    const rootUrl = new URL('/', serverUrl).toString()
    const getRes = await fetch(rootUrl, {
      headers: {
        'User-Agent': 'Kuboo3-Web/1.2.40'
      }
    })
    const formHtml = await getRes.text()
    const saltMatch = formHtml.match(/id="serversalt"\s+value="([^"]*)"/)
    const timeMatch = formHtml.match(/id="servertime"\s+(?:name="servertime"\s+)?value="([^"]*)"/)

    if (!saltMatch || !timeMatch) {
      // Server does not use Ubooquity 3 challenge form
      return null
    }

    const salt = saltMatch[1]
    const time = timeMatch[1]
    const hash = ubooquityLoginHash(password, salt, time)

    const params = new URLSearchParams()
    params.append('login', username)
    params.append('servertime', time)
    params.append('hash', hash)

    const postRes = await fetch(rootUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Kuboo3-Web/1.2.40'
      },
      body: params.toString(),
      redirect: 'manual'
    })

    const setCookie = postRes.headers.get('set-cookie')
    if (setCookie) {
      const match = setCookie.match(/UbooquitySession=([^;]+)/)
      if (match) {
        const cookieStr = `UbooquitySession=${match[1]}`
        sessionCookieStore.set(cacheKey, { cookie: cookieStr, timestamp: Date.now() })
        return cookieStr
      }
    }
  } catch (err) {
    console.warn('[Kuboo3 Server] Session authentication attempt failed:', err)
  }
  return null
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.2.40', name: 'Kuboo3 Web' })
})

// Ping test for server connection
app.post('/api/ping', async (req: Request, res: Response) => {
  const { server, username, password } = req.body
  if (!server) {
    return res.status(400).json({ success: false, error: 'Server URL is required' })
  }

  const startTime = Date.now()
  try {
    const targetUrl = new URL(server)
    const headers: Record<string, string> = {
      'User-Agent': 'Kuboo3-Web/1.2.40'
    }

    if (username && password) {
      const basic = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${basic}`
    }

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000)
    })

    const duration = Date.now() - startTime
    const text = await response.text()
    const isOpds = text.includes('<feed') || text.includes('xmlns="http://www.w3.org/2005/Atom"')

    res.json({
      success: response.ok,
      status: response.status,
      durationMs: duration,
      isOpds,
      message: response.ok ? 'Connection successful' : `Server returned HTTP ${response.status}`
    })
  } catch (err: any) {
    res.json({
      success: false,
      durationMs: Date.now() - startTime,
      error: err.message || 'Connection timed out or host unreachable'
    })
  }
})

// OPDS Feed Fetcher
app.post('/api/opds', async (req: Request, res: Response) => {
  const { server, path: opdsPath, username, password } = req.body
  if (!server) {
    return res.status(400).json({ error: 'Server URL is required' })
  }

  try {
    let fullUrl: string
    if (opdsPath && (opdsPath.startsWith('http://') || opdsPath.startsWith('https://'))) {
      fullUrl = opdsPath
    } else {
      const base = server.endsWith('/') ? server : `${server}/`
      const relative = (opdsPath || '').replace(/^\/+/, '')
      fullUrl = new URL(relative, base).toString()
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Kuboo3-Web/1.2.40',
      'Accept': 'application/atom+xml,application/xml,text/xml,*/*'
    }

    if (username && password) {
      const basic = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${basic}`

      const sessionCookie = await getOrAuthenticateSession(server, username, password)
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie
      }
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Remote server responded with ${response.status}: ${response.statusText}`,
        url: fullUrl
      })
    }

    const xmlData = await response.text()
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.send(xmlData)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch OPDS feed' })
  }
})

// Image & Page Reader Proxy
app.get('/api/proxy/image', async (req: Request, res: Response) => {
  const targetUrlStr = req.query.url as string
  const server = req.query.server as string
  const username = req.query.username as string | undefined
  const password = req.query.password as string | undefined
  const maxWidth = req.query.maxWidth as string | undefined

  if (!targetUrlStr) {
    return res.status(400).send('Target URL required')
  }

  try {
    let resolvedUrl = targetUrlStr
    if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
      if (server) {
        resolvedUrl = new URL(targetUrlStr, server).toString()
      } else {
        return res.status(400).send('Server base required for relative URL')
      }
    }

    // Apply maxWidth parameter if specified and target is page reader
    if (maxWidth && resolvedUrl.includes('/pagereader/') && !resolvedUrl.includes('width=')) {
      resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + `width=${maxWidth}`
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Kuboo3-Web/1.2.40',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
    }

    if (username && password) {
      const basic = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${basic}`

      if (server) {
        const sessionCookie = await getOrAuthenticateSession(server, username, password)
        if (sessionCookie) {
          headers['Cookie'] = sessionCookie
        }
      }
    }

    const imgRes = await fetch(resolvedUrl, {
      headers,
      signal: AbortSignal.timeout(20000)
    })

    if (!imgRes.ok) {
      return res.status(imgRes.status).send(`Failed to load image: ${imgRes.statusText}`)
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')

    const arrayBuffer = await imgRes.arrayBuffer()
    res.send(Buffer.from(arrayBuffer))
  } catch (err: any) {
    res.status(500).send(`Image proxy error: ${err.message}`)
  }
})

// Save Bookmark on remote Ubooquity server
app.post('/api/bookmark', async (req: Request, res: Response) => {
  const { server, bookId, page, username, password } = req.body
  if (!server || bookId === undefined || page === undefined) {
    return res.status(400).json({ error: 'Server, bookId, and page are required' })
  }

  try {
    // Ubooquity 3: POST /user-api/bookmark/{bookId} with plain text body of page number
    const bookmarkUrl = new URL(`/user-api/bookmark/${bookId}`, server).toString()
    const headers: Record<string, string> = {
      'User-Agent': 'Kuboo3-Web/1.2.40',
      'Content-Type': 'text/plain'
    }

    if (username && password) {
      const basic = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${basic}`

      const sessionCookie = await getOrAuthenticateSession(server, username, password)
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie
      }
    }

    const response = await fetch(bookmarkUrl, {
      method: 'POST',
      headers,
      body: String(page),
      signal: AbortSignal.timeout(5000)
    })

    res.json({ success: response.ok, status: response.status })
  } catch (err: any) {
    // Bookmark failing on demo or unreachable server should not break the client
    res.json({ success: false, error: err.message })
  }
})

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production'

  if (!isProd) {
    const { createServer } = await import('vite')
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')))
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kuboo3] Server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`)
  })
}

startServer()
