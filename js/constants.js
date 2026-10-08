// App-wide constants: stages, pillars, icons, cats, themes.

// Three stages: in the bank, on the plan, in the library
const STATUSES = ['idea', 'planned', 'posted'];

const STATUS_LABELS = { idea: 'Idea', planned: 'Planned', posted: 'Posted' };

// Older backups used five stages; everything between idea and posted is "planned" now
const LEGACY_STATUS = { filmed: 'planned', captioned: 'planned', scheduled: 'planned' };

const TONES = ['Deadpan nature-doc', 'Funny', 'Educational', 'Meme-style', 'Relatable', 'Multi-cat tie-in', 'Wholesome'];

const PLATFORMS = ['Instagram', 'TikTok', 'Both'];

// Matched line-icon set (same stroke weight/style, colored via currentColor) so the
// nav never mixes flat symbols with full-color emoji again.
const NAV_ICONS = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  outreach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3v11.5a3.5 3.5 0 1 1-3.5-3.5"></path><path d="M15 3c.5 2.5 2.3 4.4 5 4.7"></path></svg>',
  both: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="5"></circle><circle cx="16" cy="12" r="5"></circle></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
  stack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M5 7h14"></path><path d="M7 3h10"></path></svg>',
  checkSquare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
  paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="17" rx="5" ry="4"></ellipse><circle cx="5" cy="9" r="2"></circle><circle cx="10" cy="5" r="2"></circle><circle cx="15" cy="5" r="2"></circle><circle cx="19" cy="9" r="2"></circle></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>'
};

const CATS = ['Cali', 'Neo', 'Ramses', 'Diego'];

// Content pillars: every caption lives in one. `color` is the card palette class (c0–c6), so a
// caption looks the same in the bank, on the plan and in the library.
// `match` sorts captions that don't have a pillar yet (checked top to bottom, vibes catches the rest).
const PILLARS = [
  { key: 'food', label: 'Food & treats', color: 2,
    match: /food|\bfed\b|feed|breakfast|treat|snack|dinner|hungry|bowl|takis|eating|biscuit/i,
    icon: '<path d="M3 11h18a9 9 0 0 1-18 0Z"></path><path d="M7 7c0-1.5 1-1.5 1-3"></path><path d="M12 7c0-1.5 1-1.5 1-3"></path><path d="M17 7c0-1.5 1-1.5 1-3"></path>' },
  { key: 'freeloaders', label: 'No bills, no job', color: 6,
    match: /\bbills?\b|\bjobs?\b|\bwork|\brent\b|wifi|password|savings|money|shift|jobless|influencer|email|maids|house,|spoiled|without kids|feet pics/i,
    icon: '<rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path><line x1="2" y1="13" x2="22" y2="13"></line>' },
  { key: 'siblings', label: 'Sibling chaos', color: 3,
    match: /brother|multi-cat|multiple cats|2 cats?\b|second cat|share|cats have|cats when|intrusive|first cat|sync|neighbourhood|households/i,
    icon: '<circle cx="8" cy="12" r="5"></circle><circle cx="16" cy="12" r="5"></circle>' },
  { key: 'love', label: 'Love & cuddles', color: 1,
    match: /chosen|therapy|\blove|cuddl|codependent|emotionally|mama|support|charm|person\b|showed up|patience|waiting all day|daddy|\bdad\b|back rubs/i,
    icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>' },
  { key: 'chaos', label: 'Chaos & audacity', color: 4,
    match: /audacity|insane|toxic|chaos|zoomies|[356] ?am\b|meow|plotting|eye-contact|personal space|annoy|\bnotes\b|demands/i,
    icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>' },
  { key: 'care', label: 'Cat care tips', color: 0,
    match: /signs|\bcues\b|habits|setups|decoding|thinking of getting|domestic cats|nap spots|how we manage|\btail|litter|potty/i,
    icon: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>' },
  { key: 'vibes', label: 'Just vibes', color: 5, match: null,
    icon: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z"></path><path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7Z"></path>' }
];

const PILLAR_KEYS = PILLARS.map(p => p.key);

function pillarOf(key) { return PILLARS.find(p => p.key === key) || PILLARS[PILLARS.length - 1]; }

function inferPillar(text) {
  const t = String(text || '');
  const hit = PILLARS.find(p => p.match && p.match.test(t));
  return hit ? hit.key : 'vibes';
}

function pillarIconSvg(key) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + pillarOf(key).icon + '</svg>';
}

// Bottom bar: Home, Bank, +, Plan, Library. Outreach and search are reached from Home and the header.
const VIEW_META = {
  home: { label: 'Home', navLabel: 'Home', icon: NAV_ICONS.grid },
  bank: { label: 'Caption bank', navLabel: 'Bank', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>' },
  plan: { label: 'Plan', navLabel: 'Plan', icon: NAV_ICONS.calendar },
  library: { label: 'Library', navLabel: 'Library', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="5"></rect><rect x="9.5" y="3" width="5" height="5"></rect><rect x="16" y="3" width="5" height="5"></rect><rect x="3" y="9.5" width="5" height="5"></rect><rect x="9.5" y="9.5" width="5" height="5"></rect><rect x="16" y="9.5" width="5" height="5"></rect><rect x="3" y="16" width="5" height="5"></rect><rect x="9.5" y="16" width="5" height="5"></rect><rect x="16" y="16" width="5" height="5"></rect></svg>' },
  outreach: { label: 'Outreach', navLabel: 'Outreach', icon: NAV_ICONS.outreach }
};

const BRAND_STATUSES = [
  { key: 'researching', label: 'Researching' },
  { key: 'applied', label: 'Applied' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'partnered', label: 'Partnered' },
  { key: 'passed', label: 'Passed' }
];

// One look: Marina. (Other themes were dropped to keep things simple.)
const THEMES = {
  marina: {
    label: 'Marina',
    swatches: ['#F0F5FF', '#0059FF', '#FF651E', '#0A1A3D', '#FFA801'],
    vars: {
      '--paper': '#F0F5FF', '--paper-light': '#FFFFFF', '--ink': '#0A1A3D', '--ink-soft': '#6B7A99',
      '--moss': '#0059FF', '--moss-dark': '#0043C3', '--rust': '#FF651E', '--line': '#D6E6FF',
      '--stamp-idea': '#D6E6FF', '--stamp-filmed': '#0059FF', '--stamp-captioned': '#FFA801',
      '--stamp-scheduled': '#FF651E', '--stamp-posted': '#0043C3', '--spark': '#FF651E', '--spark-dark': '#C94A0E'
    }
  }
};

// ===== Cat profiles =====
// Illustrated avatars (no photos): coat colors/patterns follow each cat's breed.
const CAT_PROFILES = {
  Cali:   { breed: 'Shorthair', home: 'Downstairs', bg: '#F0B8D8', fur: '#FFF4E6', inner: '#F4A3B4', eye: '#6FA34A', pattern: 'calico' },
  Neo:    { breed: 'Shorthair', home: 'Downstairs', bg: '#A8D8BE', fur: '#2B2B30', inner: '#E592A8', eye: '#F2C230', pattern: 'tuxedo' },
  Ramses: { breed: 'Savannah',  home: 'Upstairs',   bg: '#F7EB8A', fur: '#E4BC6A', inner: '#F0A3A8', eye: '#B58A1E', pattern: 'spots', bigEars: true },
  Diego:  { breed: 'Bengal',    home: 'Upstairs',   bg: '#9CCBEE', fur: '#DA8B3F', inner: '#F0A3A8', eye: '#4F9A5A', pattern: 'rosettes' }
};
