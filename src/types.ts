export type OverlayId = 'camera' | 'chat' | 'goal' | 'donation' | 'subscriber' | 'follower' | 'alert' | 'music' | 'socials' | 'ticker' | 'clock' | 'branding'

export type Position = { x: number; y: number }
export type Size = { width: number; height: number }
export type PlatformDataSourceId = 'vk-video' | 'youtube' | 'rutube' | 'twitch'
export type DataSourceId = 'demo' | PlatformDataSourceId
export type DataSourceStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type OverlayDataEventType = 'chat-message' | 'new-subscriber' | 'paid-subscription' | 'donation' | 'viewer-count' | 'alert'

// Единый контракт событий отделяет виджеты от API конкретной стриминговой платформы.
export type OverlayDataEvent = {
  type: OverlayDataEventType
  sourceId: DataSourceId
  occurredAt: string
  payload: Record<string, string | number | boolean>
}

export type DataSourceConnection = {
  id: DataSourceId
  status: DataSourceStatus
  errorMessage?: string
}

export type OverlayItem = {
  id: OverlayId
  title: string
  description: string
  enabled: boolean
  position: Position
  size: Size
  opacity: number
  textSize: number
  dataSourceId: DataSourceId
}

export type Resolution = { label: string; width: number; height: number }
export type InterfaceScale = 'compact' | 'normal' | 'large'

export type EditorState = {
  items: Record<OverlayId, OverlayItem>
  selectedId: OverlayId
  resolution: Resolution
  customResolution: boolean
  showSafeZone: boolean
  background: 'game' | 'dark' | 'light' | 'transparent'
  primaryColor: string
  secondaryColor: string
  interfaceScale: InterfaceScale
  chatMessages: 3 | 5 | 7 | 10
  chatTime: boolean
  clockTime: boolean
  clockDate: boolean
  cameraRadius: number
  cameraBorder: number
  cameraGlow: number
  dataSources: Record<DataSourceId, DataSourceConnection>
}
