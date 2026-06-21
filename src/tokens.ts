export const C = {
  cream:      'oklch(97% 0.012 75)',
  card:       'oklch(99.5% 0.007 72)',
  sage:       'oklch(44% 0.1 145)',
  sageLight:  'oklch(93% 0.04 145)',
  brown:      'oklch(42% 0.07 55)',
  brownLight: 'oklch(94% 0.022 62)',
  text:       'oklch(22% 0.018 45)',
  textMid:    'oklch(50% 0.02 55)',
  textLight:  'oklch(67% 0.016 55)',
  border:     'oklch(91% 0.012 75)',
} as const

export const EVENT_TYPES = {
  holiday:  { label: 'Holiday',  color: '#B84030', bg: 'oklch(97% 0.025 30)',  emoji: '🎉' },
  vacation: { label: 'Vacation', color: '#1F6FA8', bg: 'oklch(97% 0.022 230)', emoji: '✈️' },
  birthday: { label: 'Birthday', color: '#9050A0', bg: 'oklch(97% 0.022 310)', emoji: '🎂' },
  other:    { label: 'Other',    color: '#557040', bg: 'oklch(97% 0.02 130)',   emoji: '📅' },
} as const

export const AVATAR_COLORS = [
  'oklch(52% 0.09 55)',
  'oklch(44% 0.1 145)',
  'oklch(48% 0.09 290)',
  'oklch(52% 0.1 35)',
  'oklch(46% 0.07 200)',
  'oklch(50% 0.09 15)',
  'oklch(44% 0.08 260)',
]

export function getEventType(type: string) {
  return EVENT_TYPES[type as keyof typeof EVENT_TYPES] ?? EVENT_TYPES.other
}

export function parseD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((parseD(dateStr).getTime() - today.getTime()) / 86400000)
}

export function formatDate(start: string, end?: string): string {
  const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [y, m, d] = start.split('-').map(Number)
  if (!end) return `${MO[m-1]} ${d}, ${y}`
  const [ey, em, ed] = end.split('-').map(Number)
  return em === m
    ? `${MO[m-1]} ${d}–${ed}, ${y}`
    : `${MO[m-1]} ${d} – ${MO[em-1]} ${ed}, ${ey}`
}

export function countdownLabel(dateStr: string): string {
  const d = daysUntil(dateStr)
  if (d === 0) return 'Today!'
  if (d === 1) return 'Tomorrow'
  if (d < 0)  return 'Past'
  if (d <= 7)  return `${d} days`
  return `${d} days away`
}

export function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
