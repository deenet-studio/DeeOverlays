import type { OverlayId } from '../types'
import './gameWidgets.css'

const ctPlayers = [
  ['Игрок 01', '100', '$4 350'], ['Pixel', '100', '$3 200'], ['Byte', '64', '$1 900'], ['Nova', '0', '$150'], ['Cyber', '82', '$2 700'],
]
const tPlayers = [
  ['Rogue', '100', '$3 550'], ['Neon', '76', '$4 100'], ['Shadow', '46', '$1 900'], ['Prime', '0', '$200'], ['Storm', '91', '$2 450'],
]

function Cs2Match() {
  return <div className="game-widget cs2-match-widget"><div className="cs2-side ct"><small>Контр-террористы</small><b>4</b><span>Живы 4/5</span></div><div className="cs2-round"><small>Раунд 8 / 24</small><b>1:24</b><span>Матч-пойнт</span></div><div className="cs2-side t"><small>Террористы</small><b>3</b><span>Живы 4/5</span></div></div>
}

function Cs2Radar() {
  return <div className="game-widget cs2-radar-widget"><header><span>ТАКТИЧЕСКИЙ РАДАР</span><b>DE_DUST2</b></header><div className="radar-map"><i className="radar-path path-a" /><i className="radar-path path-b" /><i className="radar-site site-a">A</i><i className="radar-site site-b">B</i><i className="radar-dot ct-one" /><i className="radar-dot ct-two" /><i className="radar-dot ct-three" /><i className="radar-dot t-one" /><i className="radar-dot t-two" /></div><footer><span>Вы · Мид</span><span>Север ↑</span></footer></div>
}

function TeamList({ title, side, players }: { title: string; side: 'ct' | 't'; players: string[][] }) {
  return <section className={`cs2-team ${side}`}><header><b>{title}</b><span>Живы 4/5</span></header>{players.map(([name, health, money], index) => <div className={`cs2-player-row ${health === '0' ? 'is-dead' : ''}`} key={`${side}-${name}`}><i>{index + 1}</i><span><b>{name}</b><small>{money}</small></span><em>{health}</em><strong>{health === '0' ? '—' : index % 2 ? 'M4' : 'AK'}</strong></div>)}</section>
}

function Cs2Teams() {
  return <div className="game-widget cs2-teams-widget"><TeamList title="CT" side="ct" players={ctPlayers} /><TeamList title="T" side="t" players={tPlayers} /></div>
}

function Cs2Player() {
  return <div className="game-widget cs2-player-widget"><div className="player-identity"><i>01</i><span><b>Игрок 01</b><small>Основа команды</small></span></div><div className="player-stats"><span><small>K</small><b>7</b></span><span><small>D</small><b>3</b></span><span><small>ADR</small><b>89</b></span><span><small>HS</small><b>57%</b></span></div><div className="player-loadout"><span><small>Деньги</small><b>$4 350</b></span><span><small>Оружие</small><b>AK-47</b></span><strong>30 <small>/ 90</small></strong></div><div className="player-health"><span>♥ 100</span><span>◆ 100</span></div></div>
}

function TarkovRaid() {
  return <div className="game-widget tarkov-raid-widget"><div><small>Время рейда</small><b>00:24:37</b></div><i /><div><small>Точка выхода</small><b>ЗБ-1011</b><span>Доступна</span></div></div>
}

const bodyParts = [['Голова', 35, 35], ['Грудь', 78, 85], ['Живот', 70, 70], ['Левая рука', 50, 60], ['Правая рука', 50, 60], ['Левая нога', 45, 65], ['Правая нога', 45, 65]]

function TarkovCondition() {
  return <div className="game-widget tarkov-condition-widget"><header><span>СОСТОЯНИЕ</span><b>440 / 440</b></header><div className="condition-layout"><div className="body-silhouette"><i className="body-head" /><i className="body-torso" /><i className="body-arm left" /><i className="body-arm right" /><i className="body-leg left" /><i className="body-leg right" /></div><div className="body-parts">{bodyParts.map(([label, value, max]) => <div key={String(label)}><span><b>{label}</b><em>{value}/{max}</em></span><i><u style={{ width: `${Number(value) / Number(max) * 100}%` }} /></i></div>)}</div></div></div>
}

function TarkovVitals() {
  return <div className="game-widget tarkov-vitals-widget"><div><span>✚</span><b>440</b><small>здоровье</small></div><div><span>●</span><b>82</b><small>вода</small></div><div><span>ϟ</span><b>74</b><small>энергия</small></div><div><span>≫</span><b>68</b><small>выносливость</small></div></div>
}

function TarkovWeapon() {
  return <div className="game-widget tarkov-weapon-widget"><div><small>Оружие</small><b>AK-74N</b></div><div><small>Режим огня</small><b>АВТОМАТ</b></div><div><small>Боеприпас</small><b>5.45×39 BP</b></div><strong>30 <small>/ 30</small></strong></div>
}

function TarkovLoot() {
  return <div className="game-widget tarkov-loot-widget"><header><span>ДОБЫЧА</span><b>₽ 1 247 810</b></header><div className="loot-grid"><div><i>К</i><span><b>Оружейный кейс</b><small>₽ 512 000</small></span></div><div><i>GPU</i><span><b>Видеокарта</b><small>₽ 285 000</small></span></div><div><i>LEDX</i><span><b>LEDX</b><small>₽ 164 000</small></span></div><div><i>♜</i><span><b>Статуэтка</b><small>₽ 72 000</small></span></div></div><footer><span><small>Лучший предмет</small><b>Оружейный кейс</b></span><span><small>Редчайший</small><b>Видеокарта</b></span></footer></div>
}

export function GameOverlayContent({ id }: { id: OverlayId }) {
  switch (id) {
    case 'cs2-match': return <Cs2Match />
    case 'cs2-radar': return <Cs2Radar />
    case 'cs2-teams': return <Cs2Teams />
    case 'cs2-player': return <Cs2Player />
    case 'tarkov-raid': return <TarkovRaid />
    case 'tarkov-condition': return <TarkovCondition />
    case 'tarkov-vitals': return <TarkovVitals />
    case 'tarkov-weapon': return <TarkovWeapon />
    case 'tarkov-loot': return <TarkovLoot />
    default: return null
  }
}
