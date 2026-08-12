import type { OverlayDataEvent } from '../../../src/types.ts'
import type { VkVideoChatMessage } from './types.ts'

function chatText(parts: VkVideoChatMessage['parts']): string {
  return (parts ?? []).map(part => part.text?.content ?? part.link?.content ?? part.mention?.nick ?? part.smile?.name ?? '').join('').trim()
}

function timestamp(value: number): string {
  // В документации VK время сообщения указано как числовое значение; поддерживаем секунды и миллисекунды.
  return new Date(value < 10_000_000_000 ? value * 1000 : value).toISOString()
}

// Адаптер не пропускает формат VK в виджеты: наружу передаётся общий контракт DeeOverlays.
export function adaptVkVideoChatMessage(message: VkVideoChatMessage): OverlayDataEvent | null {
  const text = chatText(message.parts)
  if (!text) return null
  return {
    type: 'chat-message',
    sourceId: 'vk-video',
    occurredAt: timestamp(message.created_at),
    payload: {
      messageId: String(message.id),
      authorId: String(message.author?.id ?? ''),
      authorName: message.author?.nick ?? 'Зритель VK Видео',
      text,
      avatarUrl: message.author?.avatar_url ?? '',
    },
  }
}

export function adaptVkVideoViewerCount(viewers: number): OverlayDataEvent {
  return { type: 'viewer-count', sourceId: 'vk-video', occurredAt: new Date().toISOString(), payload: { viewers } }
}
