import { dataSourceDefinitions, isPlatformSource, sourceStatusLabel } from '../dataSources'
import './dataSources.css'
import type { DataSourceConnection, DataSourceId } from '../types'

type Props = { sources: Record<DataSourceId, DataSourceConnection> }

export function DataSources({ sources }: Props) {
  return <section className="data-sources"><div className="sources-heading"><p>Данные</p><h2>Источники данных</h2><small>Демо-режим работает сразу. Реальные площадки будут подключаться через сервер DeeOverlays.</small></div>
    <div className="source-list">{dataSourceDefinitions.filter(source => isPlatformSource(source.id)).map(source => {
      const connection = sources[source.id]; const status = connection.status
      return <article className="source-card" key={source.id}><div><strong>{source.title}</strong><small>{source.description}</small></div><span className={`source-status status-${status}`}>{sourceStatusLabel[status]}</span>
        {connection.displayName && <small>Подключено: {connection.displayName}</small>}{connection.infoMessage && <small>{connection.infoMessage}</small>}{connection.errorMessage && <small className="source-error">{connection.errorMessage}</small>}<button type="button" className="source-action" disabled={source.availability === 'requires-backend' || status === 'connecting'}>{source.availability === 'requires-backend' ? 'Требуется сервер' : status === 'connecting' ? 'Подключаем' : 'Подключить'}</button>
      </article>
    })}</div>
  </section>
}
