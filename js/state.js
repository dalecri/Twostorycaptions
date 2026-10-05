// In-memory app state shared across the app.

let clips = [];

let activeFilter = 'all';

let tplContext = { brand: '', product: '', category: '', duration: '', name: 'Cris', cat: '', upstairsCat: '', downstairsCat: '' };

let searchQuery = '';

let activeQuickFilter = null;

let gridLayoutMode = 'stack';

 // 'stack' | 'list'
// v2 key so everyone lands on the new stacked home once; a saved 'grid' (since removed) falls back to the deck
try { gridLayoutMode = localStorage.getItem('ttt-layout-mode-v2') || 'stack'; } catch (e) {}

if (!LAYOUT_MODES.includes(gridLayoutMode)) gridLayoutMode = 'stack';

let selectMode = false;

let selectedClipIds = new Set();

let newClipTones = ['Deadpan nature-doc'];

let currentView = 'grid';

let lastAnimatedView = null;

let calMonthOffset = 0;

let currentTheme = 'marina';

let newClipCats = [];

let brands = [];

let editingBrandId = '';

let newClipDate = '';

// Outreach checklist items (Tasks tab)
let tasks = [];
