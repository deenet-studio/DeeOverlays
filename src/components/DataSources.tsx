import { dataSourceDefinitions, isPlatformSource, sourceStatusLabel } from '../dataSources'
import './dataSources.css'
import type { DataSourceConnection, DataSourceId } from '../types'

type Props = { sources: Record<DataSourceId, DataSourceConnection>; onCheck: (id: DataSourceId) => void; onDisconnect: (id: DataSourceId) => void }

export function DataSources({ sources, onCheck, onDisconnect }: Props) {
  return <section className="data-sources"><div className="sources-heading"><p>Данные</p><h2>Источники данных</h2><small>Демо-режим работает сразу. VK Видео Live можно подключить через официальный кабинет.</small></div>
    <div className="source-list">{dataSourceDefinitions.filter(source => isPlatformSource(source.id)).map(source => {
      const connection = sources[source.id]; const status = connection.status
      return <article className="source-card" key={source.id}><div><strong>{source.title}</strong><small>{source.description}</small></div><span className={`source-status status-${status}`}>{sourceStatusLabel[status]}</span>
        {connection.displayName && <small>Подключено: {connection.displayName}</small>}{connection.infoMessage && <small>{connection.infoMessage}</small>}{connection.errorMessage && <small className="source-error">{connection.errorMessage}</small>}<button type="button" className="source-action" onClick={() => status === 'connected' && source.id === 'vk-video' ? onDisconnect(source.id) : onCheck(source.id)} disabled={status === 'connecting'}>{status === 'connecting' ? 'Подключаем' : status === 'connected' && source.id === 'vk-video' ? 'Отключить' : status === 'error' ? 'Повторить' : 'Подключить'}</button>
      </article>
    })}</div>
  </section>
}
