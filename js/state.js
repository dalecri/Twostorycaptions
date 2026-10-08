// In-memory app state shared across the app.

let clips = [];

let tplContext = { brand: '', product: '', category: '', duration: '', name: 'Cris', cat: '', upstairsCat: '', downstairsCat: '' };

let searchQuery = '';

let searchOpen = false;

let currentView = 'home';

// Bank: which pillar folder is open ('' = the folder grid)
let bankPillar = '';

// Library filters and how many tiles are showing
let libraryCat = '';
let libraryPillar = '';
let libraryArchived = false;
let libraryShown = 30;

// Outreach sub-tab: 'brands' | 'pitches' | 'checklist'
let outreachTab = 'brands';

// New-card sheet
let newClipPillar = '';
let newClipStatus = '';

let lastAnimatedView = null;

let calMonthOffset = 0;

let newClipCats = [];

let brands = [];

let editingBrandId = '';

let newClipDate = '';

// Outreach checklist items (Tasks tab)
let tasks = [];
