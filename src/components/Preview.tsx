import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './widgets.css'
import type { EditorState, OverlayId, OverlayItem, Position, Size } from '../types'

type Props = { state: EditorState; onSelect: (id: OverlayId) => void; onMove: (id: OverlayId, position: Position) => void; onResize: (id: OverlayId, size: Size) => void; alertVisible: boolean }
const chat = [['Алексей', 'Отличный момент 🔥'], ['Максим', 'Хорошая катка!'], ['Сергей', 'Какой сегодня рейтинг?'], ['Евгений', 'Красиво получилось 👍'], ['Ольга', 'Удачи на стриме!']]

export function OverlayContent({ item, state, alertVisible }: { item: OverlayItem; state: EditorState; alertVisible: boolean }) {
  const style = { '--primary': state.primaryColor, '--secondary': state.secondaryColor, '--widget-text-scale': item.textSize / 100, opacity: item.opacity / 100 } as React.CSSProperties
  switch (item.id) {
    case 'camera': return <div className="camera-content" style={{ ...style, borderRadius: state.cameraRadius, borderWidth: state.cameraBorder, boxShadow: `0 0 ${state.cameraGlow}px ${state.primaryColor}66` }}><span>Камера</span><small>Временная заглушка</small></div>
    case 'chat': return <div className="chat-content" style={style}>{chat.slice(0, Math.min(state.chatMessages, 5)).map(([name, text], i) => <div className="message" key={name}><b>{name}</b>{state.chatTime && <time>22:{15 + i}</time>}<span>{text}</span></div>)}</div>
    case 'goal': return <div className="card goal" style={style}><small>Цель стрима</small><b>Новый компьютер</b><div className="progress"><i style={{ width: '73%' }} /></div><span>73 000 ₽ из 100 000 ₽ <strong>73%</strong></span></div>
    case 'donation': return <div className="card" style={style}><small>Последний донат</small><b>Александр <em>500 ₽</em></b></div>
    case 'subscriber': return <div className="card" style={style}><small>Новый подписчик</small><b>Максим</b></div>
    case 'follower': return <div className="card" style={style}><small>Новый зритель</small><b>Алина</b></div>
    case 'alert': return alertVisible ? <div className="alert-card" style={style}><span className="alert-icon">✦</span><small>Новый подписчик</small><b>Максим</b><p>Спасибо за подписку!</p></div> : <div className="alert-placeholder">Уведомления появятся здесь</div>
    case 'music': return <div className="card music" style={style}><small>Сейчас играет</small><b>Ночной город</b><span>Люмен • 1:42 / 3:46</span><div className="progress"><i style={{ width: '44%' }} /></div></div>
    case 'socials': return <div className="socials" style={style}><b>VK</b><b>Telegram</b><b>YouTube</b><b>RuTube</b><b>DeeNet.ru</b></div>
    case 'ticker': return <div className="ticker" style={style}><span>Добро пожаловать на трансляцию • Подписывайтесь на канал • Все ссылки находятся в описании</span></div>
    case 'clock': return <Clock style={style} showTime={state.clockTime} showDate={state.clockDate} />
    case 'branding': return <div className="branding" style={style}><img src="/assets/brand/deenet-studio-logo.svg" alt="" style={{ width: '1.8em', height: '1.8em', marginRight: '.42em', borderRadius: 3 }} />Powered by <b>DeeNet Studio</b></div>
  }
}
function Clock({ style, showTime, showDate }: { style: React.CSSProperties; showTime: boolean; showDate: boolean }) {
  const [now, setNow] = useState(new Date()); useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer) }, [])
  return <div className="clock" style={style}>{showTime && <b>{now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</b>}{showDate && <small>{now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</small>}</div>
}

export function Preview({ state, onSelect, onMove, onResize, alertVisible }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null); const stageRef = useRef<HTMLDivElement>(null); const drag = useRef<{ id: OverlayId; startX: number; startY: number; origin: Position; resize: boolean; originSize: Size } | null>(null)
  const [guides, setGuides] = useState({ x: false, y: false })
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const ratio = state.resolution.width / state.resolution.height

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    // Предпросмотр вписывается в доступную область, но сохраняет реальный формат выбранной трансляции.
    const fitScene = () => {
      const bounds = stage.getBoundingClientRect(); const availableWidth = Math.max(0, bounds.width - 28); const availableHeight = Math.max(0, bounds.height - 28)
      const width = Math.min(availableWidth, availableHeight * ratio); setDisplaySize({ width, height: width / ratio })
    }
    fitScene(); const observer = new ResizeObserver(fitScene); observer.observe(stage); return () => observer.disconnect()
  }, [ratio])
  const start = (event: React.PointerEvent, item: OverlayItem, resize = false) => { event.preventDefault(); event.stopPropagation(); drag.current = { id: item.id, startX: event.clientX, startY: event.clientY, origin: item.position, resize, originSize: item.size }; event.currentTarget.setPointerCapture(event.pointerId); onSelect(item.id) }
  const move = (event: React.PointerEvent) => { const action = drag.current; const bounds = sceneRef.current?.getBoundingClientRect(); if (!action || !bounds) return; const item = state.items[action.id]; const dx = (event.clientX - action.startX) / bounds.width * 100; const dy = (event.clientY - action.startY) / bounds.height * 100
    if (action.resize) {
      // Размер ограничивается свободным местом сцены: виджет нельзя растянуть за её край.
      onResize(action.id, { width: Math.max(8, Math.min(100 - item.position.x, action.originSize.width + dx)), height: Math.max(4, Math.min(100 - item.position.y, action.originSize.height + dy)) })
      return
    }
    let x = Math.max(0, Math.min(100 - item.size.width, action.origin.x + dx)); let y = Math.max(0, Math.min(100 - item.size.height, action.origin.y + dy)); const snap = 2
    const nearX = [0, 50 - item.size.width / 2, 100 - item.size.width].find(value => Math.abs(x - value) < snap); const nearY = [0, 50 - item.size.height / 2, 100 - item.size.height].find(value => Math.abs(y - value) < snap)
    if (nearX !== undefined) x = nearX; if (nearY !== undefined) y = nearY; setGuides({ x: nearX !== undefined, y: nearY !== undefined }); onMove(action.id, { x, y }) }
  return <main className="preview-area"><div className="preview-toolbar"><div><p>Рабочая область</p><h2>Предпросмотр трансляции</h2></div><span>{state.resolution.width} × {state.resolution.height} · {state.resolution.width / state.resolution.height > 1.7 ? '16:9' : '4:3'}</span></div>
    <div className="scene-wrap" ref={stageRef}><div ref={sceneRef} className={`scene background-${state.background} scale-${state.interfaceScale}`} style={{ width: displaySize.width, height: displaySize.height }} onPointerMove={move} onPointerUp={() => { drag.current = null; setGuides({ x: false, y: false }) }}>
      {state.showSafeZone && <div className="safe-zone"><span>Безопасная игровая область</span></div>}{guides.x && <i className="guide vertical" />}{guides.y && <i className="guide horizontal" />}
      {Object.values(state.items).filter(item => item.enabled).map(item => <div key={item.id} className={`overlay-item ${state.selectedId === item.id ? 'active' : ''} ${item.size.width / item.size.height > 1.7 ? 'layout-wide' : item.size.width / item.size.height < .75 ? 'layout-tall' : ''} widget-${item.id}`} style={{ left: `${item.position.x}%`, top: `${item.position.y}%`, width: `${item.size.width}%`, height: `${item.size.height}%` }} onPointerDown={event => start(event, item)} onClick={() => onSelect(item.id)}>
        <OverlayContent item={item} state={state} alertVisible={alertVisible} />{item.id !== 'branding' && <button className="resize-handle" type="button" aria-label="Изменить размер" onPointerDown={event => start(event, item, true)} />}
      </div>)}</div></div></main>
}
