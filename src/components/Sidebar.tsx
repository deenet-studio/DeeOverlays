import type { OverlayId, OverlayItem } from '../types'
import type { DataSourceConnection, DataSourceId } from '../types'
import { Toggle } from './Toggle'
import { DataSources } from './DataSources'
import { isGameOverlayItem } from '../themes'
type Props = { items: OverlayItem[]; selectedId: OverlayId; onSelect: (id: OverlayId) => void; onToggle: (id: OverlayId) => void; dataSources: Record<DataSourceId, DataSourceConnection>; onCheckSource: (id: DataSourceId) => void; onDisconnectSource: (id: DataSourceId) => void }
export function Sidebar({ items, selectedId, onSelect, onToggle, dataSources, onCheckSource, onDisconnectSource }: Props) {
  const universalItems = items.filter(item => !isGameOverlayItem(item.id))
  const gameItems = items.filter(item => isGameOverlayItem(item.id))
  const renderItem = (item: OverlayItem) => <div className={`element-row ${selectedId === item.id ? 'selected' : ''}`} key={item.id}>
      <button type="button" className="element-select" onClick={() => onSelect(item.id)}><span className="element-copy"><strong>{item.title}</strong><small>{item.description}</small></span></button>
      <Toggle checked={item.enabled} onChange={() => onToggle(item.id)} label={item.title} />
    </div>
  return <aside className="sidebar glass"><div className="panel-heading"><p>Сцена</p><h2>Элементы оверлея</h2></div><div className="element-list">
    {gameItems.length > 0 && <><p className="element-group-label">Игровые модули</p>{gameItems.map(renderItem)}<p className="element-group-label">Стриминговые элементы</p></>}{universalItems.map(renderItem)}
  </div><DataSources sources={dataSources} onCheck={onCheckSource} onDisconnect={onDisconnectSource} /></aside>
}
