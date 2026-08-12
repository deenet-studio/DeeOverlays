import type { OverlayId, OverlayItem } from '../types'
import { Toggle } from './Toggle'
type Props = { items: OverlayItem[]; selectedId: OverlayId; onSelect: (id: OverlayId) => void; onToggle: (id: OverlayId) => void }
export function Sidebar({ items, selectedId, onSelect, onToggle }: Props) {
  return <aside className="sidebar glass"><div className="panel-heading"><p>Сцена</p><h2>Элементы оверлея</h2></div><div className="element-list">
    {items.map(item => <button type="button" className={`element-row ${selectedId === item.id ? 'selected' : ''}`} key={item.id} onClick={() => onSelect(item.id)}>
      <span className="element-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
      <span onClick={event => event.stopPropagation()}><Toggle checked={item.enabled} onChange={() => onToggle(item.id)} label={item.title} /></span>
    </button>)}
  </div></aside>
}
