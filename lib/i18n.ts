// All user-visible text, in English and Bosnian. Shared by server and client code.
// Dates are formatted by hand (not Intl) so server and phone always render identical text.

import { dateParts, daysBetween, diffParts } from './dates'

export type Locale = 'bs' | 'en'

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'bs', label: 'Bosanski' },
  { id: 'en', label: 'English' },
]

export const LOCALE_COOKIE = 'btu_lang'

export function isLocale(v: unknown): v is Locale {
  return v === 'bs' || v === 'en'
}

/** Bosnian for phones set to Bosnian, Croatian, Serbian or Montenegrin; otherwise English. */
export function localeFromHeader(header: string | null | undefined): Locale {
  const first = (header ?? '').split(',')[0]?.trim().toLowerCase() ?? ''
  return /^(bs|hr|sr|sh|cnr)\b/.test(first) ? 'bs' : 'en'
}

export type DateOpts = { weekday?: boolean; year?: boolean }
type ClassId = 'gi' | 'nogi'

// ---------- English ----------

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const EN_MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const EN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const en_s = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

const EN_BELTS: Record<string, string> = {
  white: 'White',
  grey_white: 'Grey / White',
  grey: 'Grey',
  grey_black: 'Grey / Black',
  yellow_white: 'Yellow / White',
  yellow: 'Yellow',
  yellow_black: 'Yellow / Black',
  orange_white: 'Orange / White',
  orange: 'Orange',
  orange_black: 'Orange / Black',
  green_white: 'Green / White',
  green: 'Green',
  green_black: 'Green / Black',
  blue: 'Blue',
  purple: 'Purple',
  brown: 'Brown',
  black: 'Black',
}

const CLASS_NAMES: Record<string, string> = { gi: 'Gi', nogi: 'No-Gi' }

function enDate(iso: string, opts?: DateOpts) {
  const p = dateParts(iso)
  const wd = opts?.weekday ? EN_DAYS[p.weekday] + ', ' : ''
  const yr = opts?.year === false ? '' : ' ' + p.year
  return `${wd}${p.day} ${EN_MONTHS[p.month]}${yr}`
}

function enStripes(belt: string, n: number) {
  return en_s(n, belt === 'black' ? 'degree' : 'stripe')
}

const en = {
  locale: 'en' as Locale,

  date: enDate,
  month: (iso: string) => {
    const p = dateParts(iso)
    return `${EN_MONTHS_LONG[p.month]} ${p.year}`
  },
  duration: (from: string, to: string) => {
    const d = diffParts(from, to)
    if (d.future) return 'starts ' + enDate(from)
    if (d.totalMonths < 1) return en_s(d.days, 'day')
    const parts: string[] = []
    if (d.years) parts.push(en_s(d.years, 'yr'))
    if (d.months) parts.push(en_s(d.months, 'mo'))
    return parts.join(' ')
  },
  relDay: (iso: string | null | undefined, ref: string) => {
    if (!iso) return 'never'
    const d = daysBetween(iso, ref)
    if (d === 0) return 'today'
    if (d === 1) return 'yesterday'
    if (d > 1 && d < 60) return `${d} days ago`
    return enDate(iso)
  },
  dayCaption: (date: string, today: string) => {
    const d = daysBetween(date, today)
    if (d === 0) return 'Today'
    if (d === 1) return 'Yesterday'
    if (d === -1) return 'Tomorrow'
    return d > 0 ? `${d} days ago` : `In ${-d} days`
  },
  number: (n: number, digits = 0) => n.toFixed(digits),

  beltName: (id: string) => EN_BELTS[id] ?? id,
  belt: (id: string, stripes: number) =>
    `${EN_BELTS[id] ?? id} belt` + (stripes ? ` · ${enStripes(id, stripes)}` : ''),
  beltShort: (id: string, stripes: number) => (EN_BELTS[id] ?? id) + (stripes ? ` · ${enStripes(id, stripes)}` : ''),
  training: (id: string) => (id === 'both' ? 'Gi + No-Gi' : (CLASS_NAMES[id] ?? id)),
  cls: (id: string) => CLASS_NAMES[id] ?? id,

  lang: 'Language',
  nav: { attendance: 'Attendance', students: 'Students', stats: 'Stats' },
  common: {
    back: 'Back',
    edit: 'Edit',
    add: 'Add',
    archived: 'archived',
    tryAgain: 'Try again',
    searchName: 'Search name…',
    searchStudents: 'Search students',
  },

  login: {
    title: 'Log in',
    subtitle: 'Brazilian Jiu-Jitsu · Coach app',
    password: 'Coach password',
    submit: 'Log in',
    checking: 'Checking…',
  },
  setup: {
    title: 'Connect a database',
    body: 'The app is running, but no database is connected yet. In Vercel open your project → Storage → Create Database → Neon (Postgres), connect it to this project, then redeploy. See README.md for step-by-step instructions.',
  },
  failure: {
    title: 'Something went wrong',
    body: 'The app couldn’t load data. Check your internet connection. If it keeps happening, check that the database is connected in Vercel.',
  },
  notFound: {
    title: 'Not found',
    body: 'This page or student doesn’t exist (maybe it was deleted).',
    home: 'Go to attendance',
  },

  errors: {
    name: 'Please enter the student’s name.',
    belt: 'Please choose a belt.',
    stripes: 'Invalid number of stripes for this belt.',
    training: 'Please choose Gi, No-Gi or both.',
    start: 'Please enter the date they started training.',
    save: 'Could not save. Please try again.',
    wrongPassword: 'Wrong password. Try again.',
    noPassword: 'APP_PASSWORD is not set on the server. Add it in Vercel → Settings → Environment Variables.',
  },

  att: {
    addNew: 'Add new student',
    prevDay: 'Previous day',
    nextDay: 'Next day',
    pickDate: 'Pick a date',
    classTab: (cls: ClassId) => `${CLASS_NAMES[cls]} class`,
    classType: 'Class type',
    onTheMat: 'on the mat',
    backToToday: 'Back to today',
    emptyTitle: 'No students yet',
    emptyBody: 'Add your students once, then check them in here every training.',
    addFirst: 'Add first student',
    results: 'Results',
    group: (cls: ClassId) => `${CLASS_NAMES[cls]} students`,
    tapHint: 'tap to check in',
    noOne: (q: string) => `No one called “${q}”`,
    noRegulars: (cls: ClassId) => `No students train ${CLASS_NAMES[cls]} only or both. See others below.`,
    others: (cls: ClassId) => `Usually train ${CLASS_NAMES[cls]} only`,
    hide: 'Hide',
    show: (n: number) => `Show ${n}`,
    saveFailed: 'Could not save. Check your internet connection and try again.',
  },

  list: {
    title: 'Students',
    active: (n: number) => `${n} active`,
    count: (n: number) => en_s(n, 'student'),
    filter: 'Filter',
    all: 'All',
    both: 'Both',
    archived: 'Archived',
    allBelts: 'All belts',
    filterBelt: 'Filter by belt',
    sortBy: 'Sort by',
    sortName: 'Sort: Name',
    sortBelt: 'Sort: Belt',
    sortStart: 'Sort: Longest training',
    sortLast: 'Sort: Last trained',
    noMatch: 'No students match these filters.',
    emptyBody: 'Add everyone who trains at the club: belt, Gi / No-Gi and the date they started.',
  },

  form: {
    newTitle: 'New student',
    editTitle: (name: string) => `Edit ${name}`,
    name: 'Full name *',
    trains: 'Trains',
    started: 'Started training *',
    belt: 'Belt',
    kidsBelts: 'Kids belts (under 16) ▾',
    stripes: 'Stripes',
    degrees: 'Degrees',
    beltSince: 'Has this belt since',
    beltSinceHint: 'Used for “classes since last promotion”. Leave as is if you don’t know.',
    promotionDate: 'Promotion date',
    promotionHint: 'Belt or stripes changed, so this will be saved in the promotion history.',
    phone: 'Phone',
    notes: 'Notes',
    notesPlaceholder: 'Injuries, competition goals, parent contact…',
    saving: 'Saving…',
    save: 'Save changes',
    create: 'Add student',
    createAndCheckin: (cls: ClassId, date: string) => `Add & check in to ${CLASS_NAMES[cls]} (${date})`,
  },

  student: {
    backToList: 'Back to students',
    trainingSince: 'Training since',
    total: 'Total classes',
    last30: 'Last 30 days',
    thisMonth: 'This month',
    sincePromotion: 'Since promotion',
    lastTrained: 'Last trained',
    lastPromotion: 'Last promotion',
    ago: (d: string) => `${d} ago`,
    phone: 'Phone',
    notes: 'Notes',
    archived: 'Archived',
    promotions: 'Promotion history',
    noPromotions: 'No promotions recorded.',
    removePromotion: 'Remove this promotion entry',
    removePromotionConfirm: 'Remove this entry from the promotion history?',
    attendance: 'Attendance',
    latest: (n: number) => `latest ${n}`,
    noClasses: 'No classes recorded yet.',
    classes: (n: number) => `${n} ${n === 1 ? 'class' : 'classes'}`,
    addStripe: (black: boolean): string => (black ? 'Add degree' : 'Add stripe'),
    addStripeConfirm: (name: string, black: boolean) => `Give ${name} a ${black ? 'degree' : 'stripe'} today?`,
    archive: 'Archive',
    restore: 'Restore',
    archiveConfirm: (name: string) =>
      `Archive ${name}? They will be hidden from attendance, but their history is kept.`,
    restoreConfirm: (name: string) => `Restore ${name} to active students?`,
    delete: 'Delete',
    deleteConfirm: (name: string) =>
      `Permanently delete ${name} and all their attendance? This cannot be undone.\n\nTip: use Archive instead to keep their history.`,
  },

  stats: {
    title: 'Club stats',
    active: 'Active students',
    newThisMonth: (n: number) => `${n} new this month`,
    checkins: 'Check-ins this month',
    lastMonth: (n: number) => `Last month: ${n}`,
    classes: 'Classes this month',
    avg: (x: string) => `Avg ${x} per class`,
    trained: 'Trained this month',
    ofActive: (n: number) => `of ${n} active`,
    chartTitle: 'Check-ins per week',
    chartLabel: 'Weekly check-ins for the last 12 weeks',
    weekOf: 'Week of',
    readout: (week: string, total: number, gi: number, nogi: number) =>
      `Week of ${week}: ${en_s(total, 'check-in')} (${gi} Gi · ${nogi} No-Gi)`,
    barTitle: (week: string, gi: number, nogi: number) => `Week of ${week}: ${gi} Gi, ${nogi} No-Gi`,
    table: 'View as table',
    total: 'Total',
    belts: 'Belts',
    trains: 'Trains',
    noActive: 'No active students.',
    top: 'Most classes this month',
    absent: (days: number) => `Not seen for ${days}+ days`,
    allRecent: 'Everyone has trained recently. 💪',
    data: 'Data',
    csvStudents: 'Students CSV',
    csvAttendance: 'Attendance CSV',
    csvHint: 'Opens in Excel or Google Sheets. Good for backups.',
    logout: 'Log out',
  },

  csv: {
    name: 'Name',
    belt: 'Belt',
    stripes: 'Stripes',
    trains: 'Trains',
    started: 'Started',
    total: 'Total classes',
    last30: 'Last 30 days',
    lastTrained: 'Last trained',
    phone: 'Phone',
    active: 'Active',
    notes: 'Notes',
    date: 'Date',
    cls: 'Class',
    yes: 'yes',
    no: 'no',
    students: 'students',
    attendance: 'attendance',
  },
}

export type Messages = typeof en

// ---------- Bosanski ----------

const BS_MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const BS_MONTHS_LONG = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar']
const BS_DAYS = ['pon', 'uto', 'sri', 'čet', 'pet', 'sub', 'ned']

/** Bosnian plural: 1 (21, 31…) / 2–4 (22–24…) / everything else. */
function bsPlural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

const bs_n = (n: number, one: string, few: string, many: string) => `${n} ${bsPlural(n, one, few, many)}`

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const BS_BELTS: Record<string, string> = {
  white: 'Bijeli',
  grey_white: 'Sivo-bijeli',
  grey: 'Sivi',
  grey_black: 'Sivo-crni',
  yellow_white: 'Žuto-bijeli',
  yellow: 'Žuti',
  yellow_black: 'Žuto-crni',
  orange_white: 'Narandžasto-bijeli',
  orange: 'Narandžasti',
  orange_black: 'Narandžasto-crni',
  green_white: 'Zeleno-bijeli',
  green: 'Zeleni',
  green_black: 'Zeleno-crni',
  blue: 'Plavi',
  purple: 'Ljubičasti',
  brown: 'Smeđi',
  black: 'Crni',
}

function bsDate(iso: string, opts?: DateOpts) {
  const p = dateParts(iso)
  const wd = opts?.weekday ? BS_DAYS[p.weekday] + ', ' : ''
  const yr = opts?.year === false ? '' : ` ${p.year}.`
  return cap(`${wd}${p.day}. ${BS_MONTHS[p.month]}${yr}`)
}

function bsStripes(belt: string, n: number) {
  return belt === 'black' ? bs_n(n, 'stepen', 'stepena', 'stepeni') : bs_n(n, 'traka', 'trake', 'traka')
}

const bs: Messages = {
  locale: 'bs',

  date: bsDate,
  month: (iso) => {
    const p = dateParts(iso)
    return `${cap(BS_MONTHS_LONG[p.month])} ${p.year}.`
  },
  duration: (from, to) => {
    const d = diffParts(from, to)
    if (d.future) return 'počinje ' + bsDate(from)
    if (d.totalMonths < 1) return bs_n(d.days, 'dan', 'dana', 'dana')
    const parts: string[] = []
    if (d.years) parts.push(`${d.years} god.`)
    if (d.months) parts.push(`${d.months} mj.`)
    return parts.join(' ')
  },
  relDay: (iso, ref) => {
    if (!iso) return 'nikad'
    const d = daysBetween(iso, ref)
    if (d === 0) return 'danas'
    if (d === 1) return 'jučer'
    if (d > 1 && d < 60) return `prije ${bs_n(d, 'dan', 'dana', 'dana')}`
    return bsDate(iso)
  },
  dayCaption: (date, today) => {
    const d = daysBetween(date, today)
    if (d === 0) return 'Danas'
    if (d === 1) return 'Jučer'
    if (d === -1) return 'Sutra'
    return d > 0 ? `Prije ${bs_n(d, 'dan', 'dana', 'dana')}` : `Za ${bs_n(-d, 'dan', 'dana', 'dana')}`
  },
  number: (n, digits = 0) => n.toFixed(digits).replace('.', ','),

  beltName: (id) => BS_BELTS[id] ?? id,
  belt: (id, stripes) => `${BS_BELTS[id] ?? id} pojas` + (stripes ? ` · ${bsStripes(id, stripes)}` : ''),
  beltShort: (id, stripes) => (BS_BELTS[id] ?? id) + (stripes ? ` · ${bsStripes(id, stripes)}` : ''),
  training: (id) => (id === 'both' ? 'Gi + No-Gi' : (CLASS_NAMES[id] ?? id)),
  cls: (id) => CLASS_NAMES[id] ?? id,

  lang: 'Jezik',
  nav: { attendance: 'Prisustvo', students: 'Članovi', stats: 'Statistika' },
  common: {
    back: 'Nazad',
    edit: 'Uredi',
    add: 'Dodaj',
    archived: 'arhiviran',
    tryAgain: 'Pokušaj ponovo',
    searchName: 'Pretraži ime…',
    searchStudents: 'Pretraži članove',
  },

  login: {
    title: 'Prijava',
    subtitle: 'Brazilian Jiu-Jitsu · Aplikacija za trenere',
    password: 'Lozinka trenera',
    submit: 'Prijavi se',
    checking: 'Provjera…',
  },
  setup: {
    title: 'Poveži bazu podataka',
    body: 'Aplikacija radi, ali baza podataka još nije povezana. U Vercelu otvori projekat → Storage → Create Database → Neon (Postgres), poveži je s ovim projektom i ponovo pokreni deploy. Detaljna uputstva su u README.md.',
  },
  failure: {
    title: 'Nešto nije u redu',
    body: 'Aplikacija nije mogla učitati podatke. Provjeri internet vezu. Ako se ovo ponavlja, provjeri da li je baza podataka povezana u Vercelu.',
  },
  notFound: {
    title: 'Nije pronađeno',
    body: 'Ova stranica ili član ne postoji (možda je obrisan).',
    home: 'Idi na prisustvo',
  },

  errors: {
    name: 'Unesi ime i prezime.',
    belt: 'Odaberi pojas.',
    stripes: 'Neispravan broj traka za ovaj pojas.',
    training: 'Odaberi Gi, No-Gi ili oboje.',
    start: 'Unesi datum početka treniranja.',
    save: 'Nije sačuvano. Pokušaj ponovo.',
    wrongPassword: 'Pogrešna lozinka. Pokušaj ponovo.',
    noPassword: 'APP_PASSWORD nije postavljen na serveru. Dodaj ga u Vercel → Settings → Environment Variables.',
  },

  att: {
    addNew: 'Dodaj novog člana',
    prevDay: 'Prethodni dan',
    nextDay: 'Sljedeći dan',
    pickDate: 'Odaberi datum',
    classTab: (cls) => `${CLASS_NAMES[cls]} trening`,
    classType: 'Vrsta treninga',
    onTheMat: 'na tatamiju',
    backToToday: 'Nazad na danas',
    emptyTitle: 'Još nema članova',
    emptyBody: 'Dodaj članove jednom, a zatim ih ovdje označavaj na svakom treningu.',
    addFirst: 'Dodaj prvog člana',
    results: 'Rezultati',
    group: (cls) => `${CLASS_NAMES[cls]} grupa`,
    tapHint: 'dodirni za dolazak',
    noOne: (q) => `Nema nikoga s imenom „${q}“`,
    noRegulars: (cls) => `Niko ne trenira samo ${CLASS_NAMES[cls]} ili oboje. Ostali su ispod.`,
    others: (cls) => `Obično treniraju samo ${CLASS_NAMES[cls]}`,
    hide: 'Sakrij',
    show: (n) => `Prikaži (${n})`,
    saveFailed: 'Nije sačuvano. Provjeri internet vezu i pokušaj ponovo.',
  },

  list: {
    title: 'Članovi',
    active: (n) => bs_n(n, 'aktivan', 'aktivna', 'aktivnih'),
    count: (n) => bs_n(n, 'član', 'člana', 'članova'),
    filter: 'Filter',
    all: 'Svi',
    both: 'Oboje',
    archived: 'Arhivirani',
    allBelts: 'Svi pojasevi',
    filterBelt: 'Filtriraj po pojasu',
    sortBy: 'Sortiraj',
    sortName: 'Sortiraj: Ime',
    sortBelt: 'Sortiraj: Pojas',
    sortStart: 'Sortiraj: Najduže trenira',
    sortLast: 'Sortiraj: Zadnji trening',
    noMatch: 'Nijedan član ne odgovara filterima.',
    emptyBody: 'Dodaj sve koji treniraju u klubu: pojas, Gi / No-Gi i datum kad su počeli.',
  },

  form: {
    newTitle: 'Novi član',
    editTitle: (name) => `Uredi: ${name}`,
    name: 'Ime i prezime *',
    trains: 'Trenira',
    started: 'Početak treniranja *',
    belt: 'Pojas',
    kidsBelts: 'Dječiji pojasevi (do 16 god.) ▾',
    stripes: 'Trake',
    degrees: 'Stepeni',
    beltSince: 'Ima ovaj pojas od',
    beltSinceHint: 'Koristi se za „treninga od promocije“. Ostavi kako jeste ako ne znaš.',
    promotionDate: 'Datum promocije',
    promotionHint: 'Pojas ili trake su promijenjeni, pa će ovo biti sačuvano u historiji promocija.',
    phone: 'Telefon',
    notes: 'Bilješke',
    notesPlaceholder: 'Povrede, takmičarski ciljevi, kontakt roditelja…',
    saving: 'Čuvanje…',
    save: 'Sačuvaj izmjene',
    create: 'Dodaj člana',
    createAndCheckin: (cls, date) => `Dodaj i prijavi na ${CLASS_NAMES[cls]} (${date})`,
  },

  student: {
    backToList: 'Nazad na članove',
    trainingSince: 'Trenira od',
    total: 'Ukupno treninga',
    last30: 'Zadnjih 30 dana',
    thisMonth: 'Ovaj mjesec',
    sincePromotion: 'Od promocije',
    lastTrained: 'Zadnji trening',
    lastPromotion: 'Zadnja promocija',
    ago: (d) => `prije ${d}`,
    phone: 'Telefon',
    notes: 'Bilješke',
    archived: 'Arhiviran',
    promotions: 'Historija promocija',
    noPromotions: 'Nema zabilježenih promocija.',
    removePromotion: 'Ukloni ovaj unos promocije',
    removePromotionConfirm: 'Ukloniti ovaj unos iz historije promocija?',
    attendance: 'Prisustvo',
    latest: (n) => `zadnjih ${n}`,
    noClasses: 'Još nema zabilježenih treninga.',
    classes: (n) => bs_n(n, 'trening', 'treninga', 'treninga'),
    addStripe: (black) => (black ? 'Dodaj stepen' : 'Dodaj traku'),
    addStripeConfirm: (name, black) => `${name}: dodati ${black ? 'stepen' : 'traku'} danas?`,
    archive: 'Arhiviraj',
    restore: 'Vrati',
    archiveConfirm: (name) =>
      `Arhivirati: ${name}? Neće se prikazivati na prisustvu, ali historija dolazaka ostaje sačuvana.`,
    restoreConfirm: (name) => `Vratiti ${name} među aktivne članove?`,
    delete: 'Obriši',
    deleteConfirm: (name) =>
      `Trajno obrisati: ${name}, zajedno sa cijelom historijom dolazaka? Ovo se ne može poništiti.\n\nSavjet: koristi Arhiviraj da sačuvaš historiju.`,
  },

  stats: {
    title: 'Statistika kluba',
    active: 'Aktivni članovi',
    newThisMonth: (n) => `${bs_n(n, 'novi', 'nova', 'novih')} ovaj mjesec`,
    checkins: 'Dolasci ovaj mjesec',
    lastMonth: (n) => `Prošli mjesec: ${n}`,
    classes: 'Treninzi ovaj mjesec',
    avg: (x) => `Prosjek ${x} po treningu`,
    trained: 'Trenirali ovaj mjesec',
    ofActive: (n) => `od ${bs_n(n, 'aktivnog', 'aktivna', 'aktivnih')}`,
    chartTitle: 'Dolasci po sedmici',
    chartLabel: 'Dolasci po sedmici za zadnjih 12 sedmica',
    weekOf: 'Sedmica od',
    readout: (week, total, gi, nogi) =>
      `Sedmica od ${week}: ${bs_n(total, 'dolazak', 'dolaska', 'dolazaka')} (${gi} Gi · ${nogi} No-Gi)`,
    barTitle: (week, gi, nogi) => `Sedmica od ${week}: ${gi} Gi, ${nogi} No-Gi`,
    table: 'Prikaži kao tabelu',
    total: 'Ukupno',
    belts: 'Pojasevi',
    trains: 'Trenira',
    noActive: 'Nema aktivnih članova.',
    top: 'Najviše treninga ovaj mjesec',
    absent: (days) => `Nisu trenirali ${days}+ dana`,
    allRecent: 'Svi su nedavno trenirali. 💪',
    data: 'Podaci',
    csvStudents: 'Članovi CSV',
    csvAttendance: 'Prisustvo CSV',
    csvHint: 'Otvara se u Excelu ili Google Sheets. Korisno kao rezervna kopija.',
    logout: 'Odjavi se',
  },

  csv: {
    name: 'Ime i prezime',
    belt: 'Pojas',
    stripes: 'Trake',
    trains: 'Trenira',
    started: 'Početak',
    total: 'Ukupno treninga',
    last30: 'Zadnjih 30 dana',
    lastTrained: 'Zadnji trening',
    phone: 'Telefon',
    active: 'Aktivan',
    notes: 'Bilješke',
    date: 'Datum',
    cls: 'Trening',
    yes: 'da',
    no: 'ne',
    students: 'clanovi',
    attendance: 'prisustvo',
  },
}

const MESSAGES: Record<Locale, Messages> = { en, bs }

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? en
}
