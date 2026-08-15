import { useEffect, useState } from 'react'
import { hydrateEditorState } from '../data'
import { editorStorageKey, createLocalSyncSocket, createRuntimeChannel, type RuntimeMessage } from '../runtimeSync'
import type { EditorState, OverlayDataEvent } from '../types'
import { GameStatusEffect, OverlayContent, SystemBranding, WidgetShell } from './Preview'
import { isOverlayItemAvailable } from '../themes'

function readConfiguration(): EditorState {
  try {
    const saved = localStorage.getItem(editorStorageKey)
    return saved ? hydrateEditorState(JSON.parse(saved)) : hydrateEditorState(null)
  } catch { return hydrateEditorState(null) }
}

export function OverlayRuntime() {
  const [state, setState] = useState<EditorState>(readConfiguration)
  const [alertVisible, setAlertVisible] = useState(false)
  const [liveEvents, setLiveEvents] = useState<OverlayDataEvent[]>([])

  useEffect(() => {
    document.documentElement.classList.add('runtime-document')
    const channel = createRuntimeChannel()
    const receive = (message: RuntimeMessage) => {
      if (message.type === 'configuration') setState(message.state)
      if (message.type === 'test-alert') { setAlertVisible(false); requestAnimationFrame(() => setAlertVisible(true)); window.setTimeout(() => setAlertVisible(false), 4200) }
      if (message.type === 'overlay-event') setLiveEvents(events => [...events.slice(-99), message.event])
    }
    const onMessage = (event: MessageEvent<RuntimeMessage>) => receive(event.data)
    const onStorage = (event: StorageEvent) => { if (event.key === editorStorageKey) setState(readConfiguration()) }
    const socket = createLocalSyncSocket(receive)
    channel?.addEventListener('message', onMessage)
    window.addEventListener('storage', onStorage)
    return () => { document.documentElement.classList.remove('runtime-document'); channel?.removeEventListener('message', onMessage); channel?.close(); socket?.close(); window.removeEventListener('storage', onStorage) }
  }, [])

  return <main className={`runtime-scene scale-${state.interfaceScale} theme-${state.themeId}`} style={{ '--runtime-ratio': `${state.resolution.width} / ${state.resolution.height}`, '--theme-primary': state.primaryColor, '--theme-secondary': state.secondaryColor } as React.CSSProperties} aria-label="DeeOverlays Runtime">
    <GameStatusEffect state={state} />{Object.values(state.items).filter(item => item.enabled && isOverlayItemAvailable(item.id, state.themeId) && (item.id !== 'alert' || alertVisible)).map(item => <div key={item.id} className={`runtime-item overlay-item ${item.size.width / item.size.height > 1.7 ? 'layout-wide' : item.size.width / item.size.height < .75 ? 'layout-tall' : ''}`} style={{ left: `${item.position.x}%`, top: `${item.position.y}%`, width: `${item.size.width}%`, height: `${item.size.height}%` }}><WidgetShell item={item}><OverlayContent item={item} state={state} alertVisible={alertVisible} liveEvents={liveEvents} /></WidgetShell></div>)}<SystemBranding />
  </main>
}
