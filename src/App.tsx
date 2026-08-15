import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import './themes.css'
import { hydrateEditorState } from './data'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Preview } from './components/Preview'
import { Settings } from './components/Settings'
import type { DataSourceConnection, DataSourceId, EditorState, OverlayDataEvent, OverlayId, OverlayItem, Position, Size } from './types'
import { createLocalSyncSocket, createRuntimeChannel, editorStorageKey, type RuntimeMessage } from './runtimeSync'
import { OverlayRuntime } from './components/OverlayRuntime'
import { disconnectVkVideo, getVkVideoStatus, subscribeToVkVideoEvents } from './vkVideoIntegration'

function loadState(): EditorState { try { const saved = localStorage.getItem(editorStorageKey); return saved ? hydrateEditorState(JSON.parse(saved)) : hydrateEditorState(null) } catch { return hydrateEditorState(null) } }
function App() {
  const [state, setState] = useState<EditorState>(loadState); const [alertVisible, setAlertVisible] = useState(false); const [confirmReset, setConfirmReset] = useState(false)
  const [syncSocket, setSyncSocket] = useState<WebSocket | null>(null); const [syncReady, setSyncReady] = useState(false)
  const [liveEvents, setLiveEvents] = useState<OverlayDataEvent[]>([])
  useEffect(() => { const socket = createLocalSyncSocket(() => {}); setSyncSocket(socket); socket?.addEventListener('open', () => setSyncReady(true)); socket?.addEventListener('close', () => setSyncReady(false)); return () => socket?.close() }, [])
  const publish = useCallback((message: RuntimeMessage) => { const channel = createRuntimeChannel(); channel?.postMessage(message); channel?.close(); if (syncSocket?.readyState === WebSocket.OPEN) syncSocket.send(JSON.stringify(message)) }, [syncSocket])
  useEffect(() => { localStorage.setItem(editorStorageKey, JSON.stringify(state)); publish({ type: 'configuration', state }) }, [state, syncReady, publish])
  const selected = state.items[state.selectedId]; const items = useMemo(() => Object.values(state.items), [state.items])
  const update = (patch: Partial<EditorState>) => setState(previous => ({ ...previous, ...patch }))
  const updateItem = (id: OverlayId, patch: Partial<OverlayItem>) => setState(previous => ({ ...previous, items: { ...previous.items, [id]: { ...previous.items[id], ...patch } } }))
  const updateVkConnection = useCallback((connection: DataSourceConnection) => setState(previous => ({ ...previous, dataSources: { ...previous.dataSources, 'vk-video': connection } })), [])
  useEffect(() => {
    void getVkVideoStatus().then(updateVkConnection).catch(() => undefined)
    return subscribeToVkVideoEvents(event => { setLiveEvents(events => [...events.slice(-99), event]); publish({ type: 'overlay-event', event }) }, updateVkConnection)
  }, [publish, updateVkConnection])
  const checkSource = (id: DataSourceId) => {
    if (id !== 'vk-video') return
    updateVkConnection({ id, status: 'connecting' })
    window.location.assign('/integration/vk-video/connect')
  }
  const disconnectSource = (id: DataSourceId) => {
    if (id !== 'vk-video') return
    void disconnectVkVideo().then(updateVkConnection).catch(() => updateVkConnection({ id, status: 'error', errorMessage: 'Не удалось отключить VK Видео.' }))
  }
  const testAlert = () => { setAlertVisible(false); requestAnimationFrame(() => setAlertVisible(true)); publish({ type: 'test-alert' }); window.setTimeout(() => setAlertVisible(false), 4200) }
  return <div className="app-shell"><Header onPreview={() => document.querySelector('.scene-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} onReset={() => setConfirmReset(true)} /><div className="editor-grid"><Sidebar items={items} selectedId={state.selectedId} onSelect={selectedId => update({ selectedId })} onToggle={id => updateItem(id, { enabled: !state.items[id].enabled })} dataSources={state.dataSources} onCheckSource={checkSource} onDisconnectSource={disconnectSource} /><Preview state={state} onSelect={selectedId => update({ selectedId })} onMove={(id, position: Position) => updateItem(id, { position })} onResize={(id, size: Size) => updateItem(id, { size })} alertVisible={alertVisible} liveEvents={liveEvents} /><Settings state={state} item={selected} update={update} updateItem={patch => updateItem(selected.id, patch)} onTestAlert={testAlert} /></div>
  {confirmReset && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal glass"><h2>Сбросить настройки?</h2><p>Вернуть стандартное расположение и оформление элементов?</p><div><button className="ghost-button" onClick={() => setConfirmReset(false)}>Отмена</button><button className="primary-button" onClick={() => { setState(hydrateEditorState(null)); localStorage.removeItem(editorStorageKey); setConfirmReset(false) }}>Сбросить</button></div></div></div>}</div>
}
export default function RootApp() { return window.location.pathname === '/overlay/demo' ? <OverlayRuntime /> : <App /> }
