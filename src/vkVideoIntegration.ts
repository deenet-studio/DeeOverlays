import type { DataSourceConnection, OverlayDataEvent } from './types'

type VkVideoStatusResponse = { connection: DataSourceConnection }

export async function getVkVideoStatus(): Promise<DataSourceConnection> {
  const response = await fetch('/integration/vk-video/status', { cache: 'no-store' })
  if (!response.ok) throw new Error('VK integration is unavailable')
  return (await response.json() as VkVideoStatusResponse).connection
}

export async function disconnectVkVideo(): Promise<DataSourceConnection> {
  const response = await fetch('/integration/vk-video/disconnect', { method: 'POST' })
  if (!response.ok) throw new Error('VK integration is unavailable')
  return (await response.json() as VkVideoStatusResponse).connection
}

// EventSource передаёт только нормализованные события: токены и ответы VK API в браузер не попадают.
export function subscribeToVkVideoEvents(onEvent: (event: OverlayDataEvent) => void, onStatus: (connection: DataSourceConnection) => void): () => void {
  const stream = new EventSource('/integration/vk-video/events')
  stream.addEventListener('overlay-event', event => {
    try { onEvent(JSON.parse((event as MessageEvent<string>).data) as OverlayDataEvent) } catch { /* Повреждённое событие не должно останавливать предпросмотр. */ }
  })
  stream.addEventListener('source-status', event => {
    try { onStatus(JSON.parse((event as MessageEvent<string>).data) as DataSourceConnection) } catch { /* Статус будет повторно получен при следующем подключении. */ }
  })
  return () => stream.close()
}
