import { adaptVkVideoChatMessage, adaptVkVideoViewerCount } from './adapter.ts'
import { asRecord, valueAt, VkVideoApi, VkVideoApiError } from './api.ts'
import type { VkVideoConnection, VkVideoEventListener, VkVideoProfile, VkVideoStatusListener, VkVideoTokens } from './types.ts'

const sourceId = 'vk-video' as const
const chatPollIntervalMs = 4_000
const viewerPollIntervalMs = 15_000
type OAuthStage = 'token-exchange' | 'profile-request' | 'channel-detection'

function optionalString(value: unknown): string | undefined { return typeof value === 'string' && value.length > 0 ? value : undefined }
function optionalNumber(value: unknown): string | undefined { return typeof value === 'number' || typeof value === 'string' ? String(value) : undefined }

export class VkVideoDataSource {
  private tokens?: VkVideoTokens
  private profile?: VkVideoProfile
  private connection: VkVideoConnection = { id: sourceId, status: 'disconnected' }
  private chatTimer?: NodeJS.Timeout
  private viewerTimer?: NodeJS.Timeout
  private readonly knownMessageIds = new Set<string>()
  private consecutivePollingErrors = 0

  constructor(private readonly api: VkVideoApi, private readonly redirectUri: string, private readonly onEvent: VkVideoEventListener, private readonly onStatus: VkVideoStatusListener) {}

  getStatus(): VkVideoConnection { return { ...this.connection } }

  async connect(code: string): Promise<void> {
    this.stopPolling()
    this.setStatus({ id: sourceId, status: 'connecting' })
    let stage: OAuthStage = 'token-exchange'
    try {
      this.tokens = await this.api.exchangeAuthorizationCode(code, this.redirectUri)
      stage = 'profile-request'
      this.profile = this.extractProfile(await this.withToken(token => this.api.getCurrentUser(token)))
      stage = 'channel-detection'
      if (!this.profile.channelUrl) throw new VkVideoApiError('VK Видео не вернул доступный канал для подключённого пользователя.', { endpoint: 'https://api.live.vkvideo.ru/v1/current_user' })
      this.setStatus({ id: sourceId, status: 'connected', displayName: this.profile.displayName, avatarUrl: this.profile.avatarUrl, channelId: this.profile.channelId, infoMessage: 'Проверяем доступность трансляции и чата.' })
      this.startPolling()
      await this.pollViewerCount()
      await this.pollChat()
      console.info('[VK Видео] Авторизация успешна, получение событий запущено.')
    } catch (error) {
      this.stopPolling()
      this.tokens = undefined
      this.profile = undefined
      this.setStatus({ id: sourceId, status: 'error', errorMessage: this.userMessage(error) })
      this.logOAuthFailure(stage, error)
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling()
    const tokens = this.tokens
    this.tokens = undefined
    this.profile = undefined
    this.knownMessageIds.clear()
    if (tokens) await this.api.revoke(tokens).catch(() => console.warn('[VK Видео] Не удалось отозвать токен, локальная сессия очищена.'))
    this.setStatus({ id: sourceId, status: 'disconnected' })
    console.info('[VK Видео] Подключение отключено.')
  }

  private startPolling(): void {
    this.chatTimer = setInterval(() => { void this.pollChat() }, chatPollIntervalMs)
    this.viewerTimer = setInterval(() => { void this.pollViewerCount() }, viewerPollIntervalMs)
  }

  private stopPolling(): void {
    if (this.chatTimer) clearInterval(this.chatTimer)
    if (this.viewerTimer) clearInterval(this.viewerTimer)
    this.chatTimer = undefined
    this.viewerTimer = undefined
  }

  private async withToken<T>(action: (accessToken: string) => Promise<T>): Promise<T> {
    if (!this.tokens) throw new VkVideoApiError('Авторизация VK Видео отсутствует.', { endpoint: 'https://api.live.vkvideo.ru/oauth/server/token' })
    if (this.tokens.expiresAt - Date.now() < 60_000) this.tokens = await this.api.refresh(this.tokens.refreshToken, this.redirectUri)
    try { return await action(this.tokens.accessToken) }
    catch (error) {
      if (!(error instanceof VkVideoApiError) || error.status !== 401 || !this.tokens) throw error
      this.tokens = await this.api.refresh(this.tokens.refreshToken, this.redirectUri)
      return action(this.tokens.accessToken)
    }
  }

  private async pollChat(): Promise<void> {
    if (!this.profile?.channelUrl || this.connection.status !== 'connected') return
    try {
      const messages = await this.withToken(token => this.api.getChatMessages(token, this.profile!.channelUrl!))
      for (const message of messages.sort((a, b) => a.created_at - b.created_at)) {
        const id = String(message.id)
        if (this.knownMessageIds.has(id)) continue
        this.knownMessageIds.add(id)
        const event = adaptVkVideoChatMessage(message)
        if (event) this.onEvent(event)
      }
      if (this.knownMessageIds.size > 500) this.knownMessageIds.clear()
      this.consecutivePollingErrors = 0
    } catch (error) { this.handlePollingError(error) }
  }

  private async pollViewerCount(): Promise<void> {
    if (!this.profile?.channelUrl || this.connection.status !== 'connected') return
    try {
      const viewers = await this.withToken(token => this.api.getViewerCount(token, this.profile!.channelUrl!))
      this.consecutivePollingErrors = 0
      if (viewers === null) this.setStatus({ ...this.connection, infoMessage: 'Сейчас нет активной трансляции. Ожидаем начало эфира.' })
      else {
        this.setStatus({ ...this.connection, infoMessage: undefined })
        this.onEvent(adaptVkVideoViewerCount(viewers))
      }
    } catch (error) { this.handlePollingError(error) }
  }

  private handlePollingError(error: unknown): void {
    this.consecutivePollingErrors += 1
    console.warn(`[VK Видео] Ошибка polling, попытка ${this.consecutivePollingErrors}.`)
    if (this.consecutivePollingErrors >= 3) this.setStatus({ ...this.connection, status: 'error', errorMessage: this.userMessage(error) })
  }

  private extractProfile(raw: unknown): VkVideoProfile {
    const data = asRecord(raw)
    const payload = asRecord(valueAt(data, 'data')) ?? data
    const user = asRecord(valueAt(payload, 'user')) ?? asRecord(valueAt(payload, 'current_user'))
    const channels = valueAt(payload, 'channels')
    const channel = asRecord(valueAt(payload, 'channel')) ?? (Array.isArray(channels) ? asRecord(channels[0]) : undefined) ?? asRecord(valueAt(user, 'channel'))
    return {
      displayName: optionalString(valueAt(user, 'nick')) ?? optionalString(valueAt(channel, 'nick')),
      avatarUrl: optionalString(valueAt(user, 'avatar_url')) ?? optionalString(valueAt(channel, 'avatar_url')),
      channelId: optionalNumber(valueAt(channel, 'id')),
      channelUrl: optionalString(valueAt(channel, 'url')),
    }
  }

  private userMessage(error: unknown): string {
    if (error instanceof VkVideoApiError && error.status === 401) return 'Не удалось выполнить авторизацию VK Видео.'
    if (error instanceof VkVideoApiError && error.status === 403) return 'VK Видео не предоставил необходимые права доступа.'
    if (error instanceof TypeError) return 'Не удалось связаться с VK Видео. Проверьте подключение к интернету.'
    return 'VK Видео временно недоступно. Повторите попытку позже.'
  }

  private logOAuthFailure(stage: OAuthStage, error: unknown): void {
    if (error instanceof VkVideoApiError) {
      console.error('[VK Видео] OAuth диагностика.', {
        stage,
        endpoint: error.endpoint,
        httpStatus: error.status ?? null,
        apiError: error.apiError ?? null,
        errorDescription: error.apiDescription ?? null,
      })
      return
    }
    console.error('[VK Видео] OAuth диагностика.', {
      stage,
      endpoint: stage === 'token-exchange' ? 'https://api.live.vkvideo.ru/oauth/server/token' : 'https://api.live.vkvideo.ru/v1/current_user',
      httpStatus: null,
      apiError: null,
      errorDescription: error instanceof TypeError ? 'network_error' : 'unexpected_error',
    })
  }

  private setStatus(connection: VkVideoConnection): void { this.connection = connection; this.onStatus(this.getStatus()) }
}
