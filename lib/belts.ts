// IBJJF belt system. Order matters: it is the promotion order used for sorting.
// Names in each language live in lib/i18n.ts.

export type BeltGroup = 'adult' | 'kids'

export type Belt = {
  id: string
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

function kids(id: string, color: string, center?: string): Belt {
  return { id, color, center, group: 'kids', maxStripes: 4 }
}

export const BELTS: Belt[] = [
  { id: 'white', color: WHITE, group: 'adult', maxStripes: 4 },
  kids('grey_white', GREY, WHITE),
  kids('grey', GREY),
  kids('grey_black', GREY, BLACK),
  kids('yellow_white', YELLOW, WHITE),
  kids('yellow', YELLOW),
  kids('yellow_black', YELLOW, BLACK),
  kids('orange_white', ORANGE, WHITE),
  kids('orange', ORANGE),
  kids('orange_black', ORANGE, BLACK),
  kids('green_white', GREEN, WHITE),
  kids('green', GREEN),
  kids('green_black', GREEN, BLACK),
  { id: 'blue', color: '#1f5fc4', group: 'adult', maxStripes: 4 },
  { id: 'purple', color: '#6a3ea1', group: 'adult', maxStripes: 4 },
  { id: 'brown', color: '#6e4524', group: 'adult', maxStripes: 4 },
  { id: 'black', color: BLACK, group: 'adult', maxStripes: 6 },
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

export const TRAINING_TYPES = ['gi', 'nogi', 'both'] as const
export type TrainingType = (typeof TRAINING_TYPES)[number]

export const CLASS_TYPES = ['gi', 'nogi'] as const
export type ClassType = (typeof CLASS_TYPES)[number]

export function isTrainingType(v: string): v is TrainingType {
  return v === 'gi' || v === 'nogi' || v === 'both'
}

export function isClassType(v: string): v is ClassType {
  return v === 'gi' || v === 'nogi'
}

// Does a student with this training preference normally attend this class type?
export function trainsIn(training: string, classType: string) {
  return training === 'both' || training === classType
}
