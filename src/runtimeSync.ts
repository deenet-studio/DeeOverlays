import type { EditorState, OverlayDataEvent } from './types'

export const editorStorageKey = 'deeoverlays-stage-one'
export const runtimeChannelName = 'deeoverlays-runtime'

export type RuntimeMessage =
  | { type: 'configuration'; state: EditorState }
  | { type: 'test-alert' }
  | { type: 'overlay-event'; event: OverlayDataEvent }

export function createRuntimeChannel() {
  return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(runtimeChannelName)
}

export function createLocalSyncSocket(onMessage: (message: RuntimeMessage) => void) {
  if (typeof WebSocket === 'undefined') return null
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const socket = new WebSocket(`${protocol}//${window.location.host}/deeoverlays-sync`)
  socket.addEventListener('message', event => {
    try { onMessage(JSON.parse(String(event.data)) as RuntimeMessage) } catch { /* Некорректный пакет не должен ломать Runtime. */ }
  })
  return socket
}
