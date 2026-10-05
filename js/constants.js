// App-wide constants: statuses, tones, icons, cats, themes.

const STATUSES = ['idea','filmed','captioned','scheduled','posted'];

const STATUS_LABELS = { idea:'Idea', filmed:'Filmed', captioned:'Captioned', scheduled:'Scheduled', posted:'Posted' };

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

const VIEW_META = {
  grid: { label: 'Grid view', navLabel: 'Home', icon: NAV_ICONS.grid },
  calendar: { label: 'Calendar view', navLabel: 'Calendar', icon: NAV_ICONS.calendar },
  outreach: { label: 'Outreach view', navLabel: 'Brands', icon: NAV_ICONS.outreach },
  templates: { label: 'Templates view', navLabel: 'Templates', icon: NAV_ICONS.copy },
  tasks: { label: 'Tasks view', navLabel: 'Tasks', icon: NAV_ICONS.checkSquare }
};

 // null | 'search' | 'select'
const LAYOUT_MODES = ['stack', 'list'];

const BRAND_STATUSES = [
  { key: 'researching', label: 'Researching' },
  { key: 'applied', label: 'Applied' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'partnered', label: 'Partnered' },
  { key: 'passed', label: 'Passed' }
];

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
  },
  lamp: {
    label: 'Lamp',
    swatches: ['#1F150E', '#E8873A'],
    vars: {
      '--paper': '#1F150E', '--paper-light': '#2A1E14', '--ink': '#F2E6D6', '--ink-soft': '#B99B7C',
      '--moss': '#E8873A', '--moss-dark': '#C96B22', '--rust': '#C65D42', '--line': '#4A3521',
      '--stamp-idea': '#5C4A36', '--stamp-filmed': '#8A6440', '--stamp-captioned': '#B97A3E',
      '--stamp-scheduled': '#D98A3A', '--stamp-posted': '#F2A355', '--spark': '#E8873A', '--spark-dark': '#C96B22'
    }
  },
  moon: {
    label: 'Moon',
    swatches: ['#1E1826', '#B9A9D9'],
    vars: {
      '--paper': '#1E1826', '--paper-light': '#2A2233', '--ink': '#EDE7F2', '--ink-soft': '#9B8FA8',
      '--moss': '#B9A9D9', '--moss-dark': '#8F7CC4', '--rust': '#C46E8A', '--line': '#3D3448',
      '--stamp-idea': '#4A4056', '--stamp-filmed': '#6B5E82', '--stamp-captioned': '#8B7BA8',
      '--stamp-scheduled': '#A595C4', '--stamp-posted': '#CBB8EE', '--spark': '#B9A9D9', '--spark-dark': '#8F7CC4'
    }
  },
  dawn: {
    label: 'Dawn',
    swatches: ['#E9F1F6', '#3C7FA6'],
    vars: {
      '--paper': '#E9F1F6', '--paper-light': '#FFFFFF', '--ink': '#1E3A4A', '--ink-soft': '#5A7E8F',
      '--moss': '#3C7FA6', '--moss-dark': '#2A5F80', '--rust': '#C45A4A', '--line': '#C3DBE6',
      '--stamp-idea': '#AEC7D4', '--stamp-filmed': '#8CB0C4', '--stamp-captioned': '#5F93AE',
      '--stamp-scheduled': '#3C7FA6', '--stamp-posted': '#2A5F80', '--spark': '#3C7FA6', '--spark-dark': '#2A5F80'
    }
  },
  sun: {
    label: 'Sun',
    swatches: ['#F4EDDB', '#C99A2E'],
    vars: {
      '--paper': '#F4EDDB', '--paper-light': '#FFFBF0', '--ink': '#3A3226', '--ink-soft': '#8A7A56',
      '--moss': '#C99A2E', '--moss-dark': '#8A6616', '--rust': '#B5543C', '--line': '#DCCB9C',
      '--stamp-idea': '#D6C28A', '--stamp-filmed': '#C9A45C', '--stamp-captioned': '#C99A2E',
      '--stamp-scheduled': '#A97E1F', '--stamp-posted': '#8A6616', '--spark': '#C99A2E', '--spark-dark': '#8A6616'
    }
  }
};

// Same line-icon style as the nav; each tone gets its own so the row reads at a glance
const TONE_ICON_PATHS = {
  'Deadpan nature-doc': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>',
  'Funny': '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>',
  'Educational': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
  'Meme-style': '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>',
  'Relatable': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  'Multi-cat tie-in': '<circle cx="8" cy="12" r="5"></circle><circle cx="16" cy="12" r="5"></circle>',
  'Wholesome': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>'
};

// ===== Cat profiles =====
// Illustrated avatars (no photos): coat colors/patterns follow each cat's breed.
const CAT_PROFILES = {
  Cali:   { breed: 'Shorthair', home: 'Downstairs', bg: '#F0B8D8', fur: '#FFF4E6', inner: '#F4A3B4', eye: '#6FA34A', pattern: 'calico' },
  Neo:    { breed: 'Shorthair', home: 'Downstairs', bg: '#A8D8BE', fur: '#2B2B30', inner: '#E592A8', eye: '#F2C230', pattern: 'tuxedo' },
  Ramses: { breed: 'Savannah',  home: 'Upstairs',   bg: '#F7EB8A', fur: '#E4BC6A', inner: '#F0A3A8', eye: '#B58A1E', pattern: 'spots', bigEars: true },
  Diego:  { breed: 'Bengal',    home: 'Upstairs',   bg: '#9CCBEE', fur: '#DA8B3F', inner: '#F0A3A8', eye: '#4F9A5A', pattern: 'rosettes' }
};
