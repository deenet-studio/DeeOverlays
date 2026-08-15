import type { OverlayThemeId } from './types'

export type OverlayTheme = {
  id: OverlayThemeId
  title: string
  description: string
  primaryColor: string
  secondaryColor: string
}

// Пресет определяет только начальное оформление. Пользовательские позиции и размеры блоков не изменяются.
export const overlayThemes: OverlayTheme[] = [
  { id: 'universal', title: 'DeeOverlays', description: 'Фирменный Neon Glass Dark для универсального стрима.', primaryColor: '#00EAFF', secondaryColor: '#8B5CFF' },
  { id: 'cs2-competitive', title: 'CS2: турнирный', description: 'Строгие панели, холодный синий и акценты команд.', primaryColor: '#38BDF8', secondaryColor: '#A855F7' },
  { id: 'cs2-neon', title: 'CS2: ночной неон', description: 'Контрастный киберспортивный стиль с яркими гранями.', primaryColor: '#00EAFF', secondaryColor: '#E14AFF' },
  { id: 'dota-ancient', title: 'Dota 2: древние', description: 'Тёмный камень, золото и мягкий зелёный акцент.', primaryColor: '#D4A853', secondaryColor: '#55B48A' },
  { id: 'dota-arcane', title: 'Dota 2: аркана', description: 'Насыщенная магическая палитра фиолетового и лазури.', primaryColor: '#55D7FF', secondaryColor: '#9B5CFF' },
  { id: 'tarkov-tactical', title: 'Escape from Tarkov', description: 'Сдержанное тактическое оформление без лишнего свечения.', primaryColor: '#B6AE8A', secondaryColor: '#6D8068' },
  { id: 'minecraft-pixel', title: 'Minecraft', description: 'Пиксельные углы и яркие игровые акценты.', primaryColor: '#20D8FF', secondaryColor: '#D967FF' },
  { id: 'pubg-field', title: 'PUBG', description: 'Чёткие синие панели для динамичного матча.', primaryColor: '#26C7FF', secondaryColor: '#755CFF' },
  { id: 'fortnite-vivid', title: 'Fortnite', description: 'Энергичный стиль с насыщенными цветами и мягкими формами.', primaryColor: '#31D6FF', secondaryColor: '#F04DFF' },
  { id: 'gta-night', title: 'GTA V: ночной город', description: 'Городской ночной стиль с неоновыми акцентами.', primaryColor: '#00D8FF', secondaryColor: '#C65CFF' },
]

export function getOverlayTheme(id: OverlayThemeId): OverlayTheme {
  return overlayThemes.find(theme => theme.id === id) ?? overlayThemes[0]
}
