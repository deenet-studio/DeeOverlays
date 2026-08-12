import type { VkVideoChatMessage, VkVideoTokens } from './types.ts'

const apiBaseUrl = 'https://api.live.vkvideo.ru'
const oauthTokenUrl = `${apiBaseUrl}/oauth/server/token`
const oauthRevokeUrl = `${apiBaseUrl}/oauth/server/revoke`

type JsonRecord = Record<string, unknown>

export class VkVideoApiError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) { super(message); this.status = status }
}

function isRecord(value: unknown): value is JsonRecord { return typeof value === 'object' && value !== null }

async function readJson(response: Response): Promise<unknown> {
  const body: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const description = isRecord(body) && typeof body.error_description === 'string' ? body.error_description : 'VK API вернул ошибку.'
    throw new VkVideoApiError(description, response.status)
  }
  return body
}

export class VkVideoApi {
  constructor(private readonly clientId: string, private readonly clientSecret: string) {}

  private basicAuthorization(): string { return `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}` }

  async exchangeAuthorizationCode(code: string, redirectUri: string): Promise<VkVideoTokens> {
    return this.exchangeToken(new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }))
  }

  async refresh(refreshToken: string, redirectUri: string): Promise<VkVideoTokens> {
    return this.exchangeToken(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, redirect_uri: redirectUri }))
  }

  private async exchangeToken(body: URLSearchParams): Promise<VkVideoTokens> {
    const response = await fetch(oauthTokenUrl, { method: 'POST', headers: { Authorization: this.basicAuthorization(), 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    const json = await readJson(response)
    if (!isRecord(json) || typeof json.access_token !== 'string' || typeof json.refresh_token !== 'string' || typeof json.expires_in !== 'number') throw new VkVideoApiError('VK API вернул неполный ответ авторизации.')
    return { accessToken: json.access_token, refreshToken: json.refresh_token, expiresAt: Date.now() + json.expires_in * 1000 }
  }

  async revoke(tokens: VkVideoTokens): Promise<void> {
    await fetch(oauthRevokeUrl, { method: 'POST', headers: { Authorization: this.basicAuthorization(), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: tokens.refreshToken, token_type_hint: 'refresh_token' }) })
  }

  async getCurrentUser(accessToken: string): Promise<unknown> { return this.get('/v1/current_user', accessToken) }

  async getChatMessages(accessToken: string, channelUrl: string): Promise<VkVideoChatMessage[]> {
    const json = await this.get(`/v1/chat/messages?${new URLSearchParams({ channel_url: channelUrl, limit: '50' })}`, accessToken)
    const record = isRecord(json) && isRecord(json.data) ? json.data : null
    return record && Array.isArray(record.chat_messages) ? record.chat_messages.filter(isRecord).map(message => message as VkVideoChatMessage) : []
  }

  async getViewerCount(accessToken: string, channelUrl: string): Promise<number | null> {
    const json = await this.get(`/v1/channel?${new URLSearchParams({ channel_url: channelUrl })}`, accessToken)
    const data = isRecord(json) && isRecord(json.data) ? json.data : null
    const stream = data && isRecord(data.stream) ? data.stream : null
    const counters = stream && isRecord(stream.counters) ? stream.counters : null
    return counters && typeof counters.viewers === 'number' ? counters.viewers : null
  }

  private async get(path: string, accessToken: string): Promise<unknown> {
    const response = await fetch(`${apiBaseUrl}${path}`, { headers: { Authorization: `Bearer ${accessToken}` } })
    return readJson(response)
  }
}

export function valueAt(record: JsonRecord | undefined, key: string): unknown { return record?.[key] }
export function asRecord(value: unknown): JsonRecord | undefined { return isRecord(value) ? value : undefined }
