import type { DataSourceId, DataSourceStatus, OverlayDataEventType, OverlayId, PlatformDataSourceId } from './types'

export type DataSourceDefinition = {
  id: DataSourceId
  title: string
  description: string
  supportedEvents: OverlayDataEventType[]
  availability: 'ready' | 'requires-backend'
}

export const widgetDataEvent: Partial<Record<OverlayId, OverlayDataEventType>> = {
  chat: 'chat-message',
  donation: 'donation',
  subscriber: 'new-subscriber',
}

export const dataSourceDefinitions: DataSourceDefinition[] = [
  { id: 'demo', title: 'Демонстрационные данные', description: 'Тестовые сообщения и события без подключения платформы.', supportedEvents: ['chat-message', 'new-subscriber', 'paid-subscription', 'donation', 'viewer-count', 'alert'], availability: 'ready' },
  { id: 'vk-video', title: 'VK Видео', description: 'Официальный чат и число зрителей VK Видео Live.', supportedEvents: ['chat-message', 'viewer-count'], availability: 'requires-backend' },
  { id: 'youtube', title: 'YouTube', description: 'Чат и события трансляции YouTube.', supportedEvents: ['chat-message', 'new-subscriber', 'paid-subscription', 'donation', 'viewer-count', 'alert'], availability: 'requires-backend' },
  { id: 'rutube', title: 'RuTube', description: 'Чат и доступные события RuTube.', supportedEvents: ['chat-message', 'new-subscriber', 'donation', 'viewer-count', 'alert'], availability: 'requires-backend' },
  { id: 'twitch', title: 'Twitch', description: 'Чат и события трансляции Twitch.', supportedEvents: ['chat-message', 'new-subscriber', 'paid-subscription', 'donation', 'viewer-count', 'alert'], availability: 'requires-backend' },
]

export const sourceStatusLabel: Record<DataSourceStatus, string> = {
  disconnected: 'Не подключено', connecting: 'Подключение', connected: 'Подключено', error: 'Ошибка',
}

export function getSourceDefinition(id: DataSourceId) {
  return dataSourceDefinitions.find(source => source.id === id) ?? dataSourceDefinitions[0]
}

export function isPlatformSource(id: DataSourceId): id is PlatformDataSourceId {
  return id !== 'demo'
}
