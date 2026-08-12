import type { DataSourceConnection, OverlayDataEvent } from '../../../src/types.ts'

export type VkVideoConnection = Pick<DataSourceConnection, 'id' | 'status' | 'errorMessage' | 'infoMessage' | 'displayName' | 'channelId' | 'avatarUrl'>

export type VkVideoEventListener = (event: OverlayDataEvent) => void
export type VkVideoStatusListener = (connection: VkVideoConnection) => void

export type VkVideoTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type VkVideoProfile = {
  displayName?: string
  avatarUrl?: string
  channelId?: string
  channelUrl?: string
}

export type VkVideoChatMessage = {
  id: string | number
  created_at: number
  author?: { id?: string | number; nick?: string; avatar_url?: string }
  parts?: Array<{
    text?: { content?: string }
    link?: { content?: string }
    mention?: { nick?: string }
    smile?: { name?: string }
  }>
}
