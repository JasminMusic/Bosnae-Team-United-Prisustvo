// IBJJF belt system. Order matters: it is the promotion order used for sorting.

export type BeltGroup = 'adult' | 'kids'

export type Belt = {
  id: string
  label: string
  color: string
  // Kids belts have a white or black stripe running along the middle.
  center?: string
  group: BeltGroup
  maxStripes: number
}

const WHITE = '#f3f2ee'
const GREY = '#8d9196'
const YELLOW = '#f2c12e'
const ORANGE = '#ea7a2c'
const GREEN = '#2f8f57'
const BLACK = '#141414'

function kids(id: string, label: string, color: string, center?: string): Belt {
  return { id, label, color, center, group: 'kids', maxStripes: 4 }
}

export const BELTS: Belt[] = [
  { id: 'white', label: 'White', color: WHITE, group: 'adult', maxStripes: 4 },
  kids('grey_white', 'Grey / White', GREY, WHITE),
  kids('grey', 'Grey', GREY),
  kids('grey_black', 'Grey / Black', GREY, BLACK),
  kids('yellow_white', 'Yellow / White', YELLOW, WHITE),
  kids('yellow', 'Yellow', YELLOW),
  kids('yellow_black', 'Yellow / Black', YELLOW, BLACK),
  kids('orange_white', 'Orange / White', ORANGE, WHITE),
  kids('orange', 'Orange', ORANGE),
  kids('orange_black', 'Orange / Black', ORANGE, BLACK),
  kids('green_white', 'Green / White', GREEN, WHITE),
  kids('green', 'Green', GREEN),
  kids('green_black', 'Green / Black', GREEN, BLACK),
  { id: 'blue', label: 'Blue', color: '#1f5fc4', group: 'adult', maxStripes: 4 },
  { id: 'purple', label: 'Purple', color: '#6a3ea1', group: 'adult', maxStripes: 4 },
  { id: 'brown', label: 'Brown', color: '#6e4524', group: 'adult', maxStripes: 4 },
  { id: 'black', label: 'Black', color: BLACK, group: 'adult', maxStripes: 6 },
]

const BY_ID = new Map(BELTS.map((b, i) => [b.id, { ...b, rank: i }]))

export function getBelt(id: string) {
  return BY_ID.get(id) ?? { ...BELTS[0], rank: 0 }
}

export function isBelt(id: string) {
  return BY_ID.has(id)
}

export function beltRank(id: string) {
  return getBelt(id).rank
}

export function beltLabel(id: string, stripes: number) {
  const belt = getBelt(id)
  if (!stripes) return `${belt.label} belt`
  const unit = id === 'black' ? 'degree' : 'stripe'
  return `${belt.label} belt · ${stripes} ${unit}${stripes === 1 ? '' : 's'}`
}

export const TRAINING_TYPES = [
  { id: 'gi', label: 'Gi' },
  { id: 'nogi', label: 'No-Gi' },
  { id: 'both', label: 'Gi + No-Gi' },
] as const

export type TrainingType = (typeof TRAINING_TYPES)[number]['id']

export const CLASS_TYPES = [
  { id: 'gi', label: 'Gi' },
  { id: 'nogi', label: 'No-Gi' },
] as const

export type ClassType = (typeof CLASS_TYPES)[number]['id']

export function isTrainingType(v: string): v is TrainingType {
  return v === 'gi' || v === 'nogi' || v === 'both'
}

export function isClassType(v: string): v is ClassType {
  return v === 'gi' || v === 'nogi'
}

export function trainingLabel(t: string) {
  return TRAINING_TYPES.find((x) => x.id === t)?.label ?? t
}

export function classLabel(t: string) {
  return CLASS_TYPES.find((x) => x.id === t)?.label ?? t
}

// Does a student with this training preference normally attend this class type?
export function trainsIn(training: string, classType: string) {
  return training === 'both' || training === classType
}
