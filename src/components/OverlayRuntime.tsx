import { useEffect, useState } from 'react'
import { createDefaultState } from '../data'
import { editorStorageKey, createLocalSyncSocket, createRuntimeChannel, type RuntimeMessage } from '../runtimeSync'
import type { EditorState } from '../types'
import { OverlayContent } from './Preview'

function readConfiguration(): EditorState {
  try {
    const saved = localStorage.getItem(editorStorageKey)
    return saved ? { ...createDefaultState(), ...JSON.parse(saved) } : createDefaultState()
  } catch { return createDefaultState() }
}

export function OverlayRuntime() {
  const [state, setState] = useState<EditorState>(readConfiguration)
  const [alertVisible, setAlertVisible] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('runtime-document')
    const channel = createRuntimeChannel()
    const receive = (message: RuntimeMessage) => {
      if (message.type === 'configuration') setState(message.state)
      if (message.type === 'test-alert') { setAlertVisible(false); requestAnimationFrame(() => setAlertVisible(true)); window.setTimeout(() => setAlertVisible(false), 4200) }
    }
    const onMessage = (event: MessageEvent<RuntimeMessage>) => receive(event.data)
    const onStorage = (event: StorageEvent) => { if (event.key === editorStorageKey) setState(readConfiguration()) }
    const socket = createLocalSyncSocket(receive)
    channel?.addEventListener('message', onMessage)
    window.addEventListener('storage', onStorage)
    return () => { document.documentElement.classList.remove('runtime-document'); channel?.removeEventListener('message', onMessage); channel?.close(); socket?.close(); window.removeEventListener('storage', onStorage) }
  }, [])

  return <main className={`runtime-scene scale-${state.interfaceScale}`} style={{ '--runtime-ratio': `${state.resolution.width} / ${state.resolution.height}` } as React.CSSProperties} aria-label="DeeOverlays Runtime">
    {Object.values(state.items).filter(item => item.enabled).map(item => <div key={item.id} className={`runtime-item ${item.size.width / item.size.height > 1.7 ? 'layout-wide' : item.size.width / item.size.height < .75 ? 'layout-tall' : ''}`} style={{ left: `${item.position.x}%`, top: `${item.position.y}%`, width: `${item.size.width}%`, height: `${item.size.height}%` }}><OverlayContent item={item} state={state} alertVisible={alertVisible} /></div>)}
  </main>
}
