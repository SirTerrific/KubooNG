import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'
import url from 'url'

function hmacSha256(key: string, message: string): string {
  return crypto.createHmac('sha256', key).update(message).digest('hex')
}

function ubooquityLoginHash(password: string, salt: string, time: string): string {
  const inner = hmacSha256(password, salt)
  return hmacSha256(inner, time)
}

const sessionCookieStore = new Map<string, { cookie: string; timestamp: number }>()

async function getOrAuthenticateSession(serverUrl: string, username?: string, password?: string): Promise<string | null> {
  if (!username || !password) return null
  const cacheKey = `${serverUrl}|${username}`
  const cached = sessionCookieStore.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
    return cached.cookie
  }

  try {
    const rootUrl = new URL('/', serverUrl).toString()
    const getRes = await fetch(rootUrl, {
      headers: { 'User-Agent': 'Kuboo3-Web/1.2.40' }
    })
    const formHtml = await getRes.text()
    const saltMatch = formHtml.match(/id="serversalt"\s+value="([^"]*)"/)
    const timeMatch = formHtml.match(/id="servertime"\s+(?:name="servertime"\s+)?value="([^"]*)"/)

    if (!saltMatch || !timeMatch) return null

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
    console.warn('[Kuboo3 API] Session auth failed:', err)
  }
  return null
}

function kubooApiPlugin(): Plugin {
  const attachMiddleware = (server: any) => {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const parsedUrl = url.parse(req.url || '', true)
      const pathname = parsedUrl.pathname || ''

      if (!pathname.startsWith('/api/')) {
        return next()
      }

      // Helper to read JSON body
      const readJsonBody = async (): Promise<any> => {
        return new Promise((resolve) => {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk })
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {})
            } catch {
              resolve({})
            }
          })
        })
      }

      // /api/health
      if (pathname === '/api/health') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ status: 'ok', version: '1.2.40', name: 'Kuboo3 Web' }))
        return
      }

      // /api/ping
      if (pathname === '/api/ping' && req.method === 'POST') {
        const body = await readJsonBody()
        const { server: serverUrl, username, password } = body
        if (!serverUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'Server URL required' }))
          return
        }

        const startTime = Date.now()
        try {
          const target = new URL(serverUrl)
          const headers: Record<string, string> = { 'User-Agent': 'Kuboo3-Web/1.2.40' }
          if (username && password) {
            headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
          }

          const response = await fetch(target.toString(), {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(8000)
          })

          const text = await response.text()
          const isOpds = text.includes('<feed') || text.includes('xmlns="http://www.w3.org/2005/Atom"')

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: response.ok,
            status: response.status,
            durationMs: Date.now() - startTime,
            isOpds,
            message: response.ok ? 'Connection successful' : `HTTP ${response.status}`
          }))
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: false,
            durationMs: Date.now() - startTime,
            error: err.message || 'Connection failed'
          }))
        }
        return
      }

      // /api/opds
      if (pathname === '/api/opds' && req.method === 'POST') {
        const body = await readJsonBody()
        const { server: serverUrl, path: opdsPath, username, password } = body
        if (!serverUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Server URL required' }))
          return
        }

        try {
          let fullUrl: string
          if (opdsPath && (opdsPath.startsWith('http://') || opdsPath.startsWith('https://'))) {
            fullUrl = opdsPath
          } else {
            const base = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`
            const relative = (opdsPath || '').replace(/^\/+/, '')
            fullUrl = new URL(relative, base).toString()
          }

          const headers: Record<string, string> = {
            'User-Agent': 'Kuboo3-Web/1.2.40',
            'Accept': 'application/atom+xml,application/xml,text/xml,*/*'
          }

          if (username && password) {
            headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            const sessionCookie = await getOrAuthenticateSession(serverUrl, username, password)
            if (sessionCookie) headers['Cookie'] = sessionCookie
          }

          const response = await fetch(fullUrl, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(15000)
          })

          if (!response.ok) {
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Server returned ${response.status}`, url: fullUrl }))
            return
          }

          const xmlData = await response.text()
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          res.end(xmlData)
        } catch (err: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'OPDS fetch failed' }))
        }
        return
      }

      // /api/proxy/image
      if (pathname === '/api/proxy/image') {
        const query = parsedUrl.query
        const targetUrlStr = query.url as string
        const serverUrl = query.server as string
        const username = query.username as string | undefined
        const password = query.password as string | undefined
        const maxWidth = query.maxWidth as string | undefined

        if (!targetUrlStr) {
          res.statusCode = 400
          res.end('Target URL required')
          return
        }

        try {
          let resolvedUrl = targetUrlStr
          if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
            if (serverUrl) {
              resolvedUrl = new URL(targetUrlStr, serverUrl).toString()
            } else {
              res.statusCode = 400
              res.end('Server required for relative URL')
              return
            }
          }

          if (maxWidth && resolvedUrl.includes('/pagereader/') && !resolvedUrl.includes('width=')) {
            resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + `width=${maxWidth}`
          }

          const headers: Record<string, string> = {
            'User-Agent': 'Kuboo3-Web/1.2.40',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
          }

          if (username && password) {
            headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            if (serverUrl) {
              const sessionCookie = await getOrAuthenticateSession(serverUrl, username, password)
              if (sessionCookie) headers['Cookie'] = sessionCookie
            }
          }

          const imgRes = await fetch(resolvedUrl, { headers, signal: AbortSignal.timeout(20000) })
          if (!imgRes.ok) {
            res.statusCode = imgRes.status
            res.end(`Image load failed: ${imgRes.statusText}`)
            return
          }

          const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
          res.setHeader('Content-Type', contentType)
          res.setHeader('Cache-Control', 'public, max-age=86400')
          const arrayBuffer = await imgRes.arrayBuffer()
          res.end(Buffer.from(arrayBuffer))
        } catch (err: any) {
          res.statusCode = 500
          res.end(`Proxy error: ${err.message}`)
        }
        return
      }

      // /api/bookmark
      if (pathname === '/api/bookmark' && req.method === 'POST') {
        const body = await readJsonBody()
        const { server: serverUrl, bookId, page, username, password } = body
        if (!serverUrl || bookId === undefined || page === undefined) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Server, bookId, page required' }))
          return
        }

        try {
          const bookmarkUrl = new URL(`/user-api/bookmark/${bookId}`, serverUrl).toString()
          const headers: Record<string, string> = {
            'User-Agent': 'Kuboo3-Web/1.2.40',
            'Content-Type': 'text/plain'
          }
          if (username && password) {
            headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            const sessionCookie = await getOrAuthenticateSession(serverUrl, username, password)
            if (sessionCookie) headers['Cookie'] = sessionCookie
          }

          const response = await fetch(bookmarkUrl, {
            method: 'POST',
            headers,
            body: String(page),
            signal: AbortSignal.timeout(5000)
          })

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: response.ok, status: response.status }))
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: err.message }))
        }
        return
      }

      next()
    })
  }

  return {
    name: 'kuboo-api-plugin',
    configureServer(server) {
      attachMiddleware(server)
    },
    configurePreviewServer(server) {
      attachMiddleware(server)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), kubooApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  }
})
