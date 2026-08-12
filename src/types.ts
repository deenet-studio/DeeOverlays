export type OverlayId = 'camera' | 'chat' | 'goal' | 'donation' | 'subscriber' | 'follower' | 'alert' | 'music' | 'socials' | 'ticker' | 'clock' | 'branding'

export type Position = { x: number; y: number }
export type Size = { width: number; height: number }

export type OverlayItem = {
  id: OverlayId
  title: string
  description: string
  enabled: boolean
  position: Position
  size: Size
  opacity: number
  textSize: number
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
}
