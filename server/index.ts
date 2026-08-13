import 'dotenv/config'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { randomBytes } from 'node:crypto'
import { VkVideoApi } from './integrations/vk-video/api.ts'
import { VkVideoDataSource } from './integrations/vk-video/VkVideoDataSource.ts'
import type { VkVideoConnection } from './integrations/vk-video/types.ts'
import type { OverlayDataEvent } from '../src/types.ts'

const port = 8787
const frontendOrigin = process.env.DEEOVERLAYS_FRONTEND_ORIGIN ?? 'http://127.0.0.1:5173'
const clientId = process.env.VK_VIDEO_LIVE_CLIENT_ID
const clientSecret = process.env.VK_VIDEO_LIVE_CLIENT_SECRET
const redirectUri = process.env.VK_VIDEO_LIVE_REDIRECT_URI ?? 'https://dev-overlays.deenet.ru/integration/vk-video/callback'
const clients = new Set<ServerResponse>()
const pendingOAuthStates = new Map<string, number>()
const oauthStateLifetimeMs = 10 * 60 * 1000

function configured(): boolean { return Boolean(clientId && clientSecret) }

const source = configured()
  ? new VkVideoDataSource(new VkVideoApi(clientId!, clientSecret!), redirectUri, publishOverlayEvent, publishStatus)
  : undefined

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}

function redirect(response: ServerResponse, location: string): void {
  response.writeHead(302, { Location: location })
  response.end()
}

function isPendingOAuthState(state: string): boolean {
  const expiresAt = pendingOAuthStates.get(state)
  pendingOAuthStates.delete(state)
  return typeof expiresAt === 'number' && expiresAt > Date.now()
}

function removeExpiredOAuthStates(): void {
  const now = Date.now()
  for (const [state, expiresAt] of pendingOAuthStates) if (expiresAt <= now) pendingOAuthStates.delete(state)
}

function publish(event: string, body: unknown): void {
  const packet = `event: ${event}\ndata: ${JSON.stringify(body)}\n\n`
  for (const client of clients) client.write(packet)
}

function publishOverlayEvent(event: OverlayDataEvent): void { publish('overlay-event', event) }
function publishStatus(connection: VkVideoConnection): void { publish('source-status', connection) }

function connectionStatus(): VkVideoConnection {
  if (source) return source.getStatus()
  return { id: 'vk-video', status: 'error', errorMessage: 'Заполните параметры приложения VK Видео в файле .env.' }
}

const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1:8787'}`)
  if (url.pathname === '/health') return json(response, 200, { ok: true })
  if (url.pathname === '/integration/vk-video/status' && request.method === 'GET') return json(response, 200, { connection: connectionStatus() })
  if (url.pathname === '/integration/vk-video/events' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' })
    response.write(`event: source-status\ndata: ${JSON.stringify(connectionStatus())}\n\n`)
    clients.add(response)
    request.on('close', () => clients.delete(response))
    return
  }
  if (url.pathname === '/integration/vk-video/connect' && request.method === 'GET') {
    if (!source || !clientId) return redirect(response, `${frontendOrigin}/?vkVideo=configuration-error`)
    const state = randomBytes(24).toString('hex')
    removeExpiredOAuthStates()
    // Callback приходит через HTTPS-домен, а авторизация запускается с localhost.
    // Одноразовый state хранится на сервере, иначе cookie localhost не дошла бы до callback.
    pendingOAuthStates.set(state, Date.now() + oauthStateLifetimeMs)
    const authorizationUrl = new URL('https://auth.live.vkvideo.ru/app/oauth2/authorize')
    authorizationUrl.searchParams.set('client_id', clientId)
    authorizationUrl.searchParams.set('redirect_uri', redirectUri)
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('state', state)
    console.info('[VK Видео] Подключение начато.')
    return redirect(response, authorizationUrl.toString())
  }
  if (url.pathname === '/integration/vk-video/callback' && request.method === 'GET') {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (!source || !code || !state || !isPendingOAuthState(state)) {
      console.warn('[VK Видео] OAuth диагностика.', {
        stage: 'callback',
        endpoint: '/integration/vk-video/callback',
        httpStatus: null,
        apiError: 'invalid_callback',
        errorDescription: 'missing_code_or_invalid_state',
      })
      return redirect(response, `${frontendOrigin}/?vkVideo=error`)
    }
    await source.connect(code)
    const status = source.getStatus().status
    return redirect(response, `${frontendOrigin}/?vkVideo=${status === 'connected' ? 'connected' : 'error'}`)
  }
  if (url.pathname === '/integration/vk-video/disconnect' && request.method === 'POST') {
    await source?.disconnect()
    return json(response, 200, { connection: connectionStatus() })
  }
  return json(response, 404, { error: 'not_found' })
})

server.listen(port, '127.0.0.1', () => console.info(`[DeeOverlays] Локальный сервис VK Видео запущен на http://127.0.0.1:${port}.`))
