const collator = new Intl.Collator('bs', { sensitivity: 'base', numeric: true })

/** Lowercase and strip diacritics so "cehic" finds "Čehić" and "dzeko" finds "Džeko". */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function compareNames(a: string, b: string) {
  return collator.compare(a, b)
}

export function sortByName<T extends { name: string }>(list: T[]) {
  return [...list].sort((a, b) => compareNames(a.name, b.name))
}
