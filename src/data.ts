import type { EditorState, OverlayId, OverlayItem, Resolution } from './types'

export const resolutions: Resolution[] = [
  { label: '1920 × 1080', width: 1920, height: 1080 }, { label: '2560 × 1440', width: 2560, height: 1440 },
  { label: '3840 × 2160', width: 3840, height: 2160 }, { label: '1280 × 720', width: 1280, height: 720 },
  { label: '1440 × 1080', width: 1440, height: 1080 }, { label: '1920 × 1200', width: 1920, height: 1200 },
]

const makeItem = (id: OverlayId, title: string, description: string, x: number, y: number, width: number, height: number): OverlayItem =>
  ({ id, title, description, enabled: true, position: { x, y }, size: { width, height }, opacity: 78, textSize: 100 })

export const createDefaultState = (): EditorState => ({
  items: {
    camera: makeItem('camera', 'Камера стримера', 'Видео с вашей веб-камеры.', 3, 68, 20, 25),
    chat: makeItem('chat', 'Чат зрителей', 'Сообщения зрителей во время трансляции.', 73, 24, 24, 43),
    goal: makeItem('goal', 'Цель стрима', 'Прогресс и цель трансляции.', 34, 4, 32, 10),
    donation: makeItem('donation', 'Последний донат', 'Последнее пожертвование зрителя.', 3, 4, 20, 10),
    subscriber: makeItem('subscriber', 'Новый подписчик', 'Последний подписавшийся зритель.', 77, 4, 20, 10),
    follower: makeItem('follower', 'Новый зритель', 'Последний новый зритель канала.', 3, 30, 20, 9),
    alert: makeItem('alert', 'Уведомления', 'Всплывающие события трансляции.', 35, 35, 30, 19),
    music: makeItem('music', 'Сейчас играет', 'Информация о текущей композиции.', 35, 87, 30, 9),
    socials: makeItem('socials', 'Социальные сети', 'Ссылки на ваши площадки.', 30, 76, 40, 7),
    ticker: makeItem('ticker', 'Бегущая строка', 'Важная информация для зрителей.', 21, 96, 58, 4),
    clock: makeItem('clock', 'Часы', 'Локальное время в браузере.', 82, 88, 15, 7),
    branding: makeItem('branding', 'Powered by DeeNet Studio', 'Небольшая фирменная подпись.', 72, 68, 25, 5),
  },
  selectedId: 'camera', resolution: resolutions[0], customResolution: false, showSafeZone: false, background: 'game',
  primaryColor: '#00EAFF', secondaryColor: '#8B5CFF', interfaceScale: 'normal', chatMessages: 5, chatTime: true,
  clockTime: true, clockDate: true, cameraRadius: 18, cameraBorder: 2, cameraGlow: 45,
})
