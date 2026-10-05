// Saving and loading everything on this device, preferences, and validation of stored or imported data.

// ===== On-device storage =====
// Everything lives on this device, no account or server. In the Android app the data is a
// JSON file in the app's private storage (Capacitor Filesystem), mirrored to localStorage so a
// half-written file can never lose everything. In a browser it's localStorage only.
const STORE_KEY = 'tsc-data-v1';

const STORE_FILE = 'twostorycaptions-data.json';

function nativeFs() {
  const cap = window.Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
  return (cap.Plugins && cap.Plugins.Filesystem) || null;
}

function setSyncStatus(text, isError) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? 'var(--rust)' : '';
}

function safeParseJSON(val, fallback) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch (e) { return fallback; }
}

function parseStore(text) {
  const d = safeParseJSON(text, null);
  return d && typeof d === 'object' && !Array.isArray(d) ? d : null;
}

async function readStore() {
  const fs = nativeFs();
  if (fs) {
    try {
      const { data } = await fs.readFile({ path: STORE_FILE, directory: 'DATA', encoding: 'utf8' });
      const parsed = parseStore(data);
      if (parsed) return parsed;
    } catch (e) { /* no file yet, fall back to the mirror */ }
  }
  try { return parseStore(localStorage.getItem(STORE_KEY)); } catch (e) { return null; }
}

let persistTimer = null;

async function writeStore() {
  clearTimeout(persistTimer);
  persistTimer = null;
  const json = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), clips, brands, tasks, settings });
  let ok = false;
  try { localStorage.setItem(STORE_KEY, json); ok = true; } catch (e) { console.error('localStorage save failed', e); }
  const fs = nativeFs();
  if (fs) {
    try {
      await fs.writeFile({ path: STORE_FILE, data: json, directory: 'DATA', encoding: 'utf8' });
      ok = true;
    } catch (e) {
      console.error('File save failed', e);
    }
  }
  setSyncStatus(ok ? 'Saved on this device' : 'Save failed, export a backup', !ok);
  if (!ok) showToast("Couldn't save. Export a backup from Settings.", { error: true, duration: 6000 });
  if (typeof scheduleReminderSync === 'function') scheduleReminderSync();
  return ok;
}

// Edits come in bursts (toggling chips, bulk actions), so batch them into one write.
function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(writeStore, 250);
}

// Flush right away if the app is backgrounded or closed inside that window.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && persistTimer) writeStore();
});

window.addEventListener('pagehide', () => { if (persistTimer) writeStore(); });

// ===== Preferences saved with the data (so they're in backups too) =====
const DEFAULT_SETTINGS = {
  weeklyGoal: 3,
  hashtagsInstagram: '#catsofig #catsofinstagram #catlife',
  hashtagsTiktok: '#catsoftiktok #bengalsoftiktok #savannahcat #catlife',
  remindersOn: false,
  reminderTime: '09:00',
  remindedFollowUps: {}   // brandId -> { due, at }: overdue follow-ups already reminded once
};

let settings = { ...DEFAULT_SETTINGS };

function normalizeSettings(x) {
  const o = x && typeof x === 'object' ? x : {};
  const goal = Number(o.weeklyGoal);
  const reminded = {};
  if (o.remindedFollowUps && typeof o.remindedFollowUps === 'object') {
    Object.entries(o.remindedFollowUps).forEach(([id, v]) => {
      if (SAFE_ID.test(id) && v && ISO_DAY.test(v.due) && !isNaN(Date.parse(v.at))) reminded[id] = { due: v.due, at: v.at };
    });
  }
  return {
    weeklyGoal: Number.isInteger(goal) && goal >= 1 && goal <= 7 ? goal : DEFAULT_SETTINGS.weeklyGoal,
    hashtagsInstagram: typeof o.hashtagsInstagram === 'string' ? o.hashtagsInstagram.slice(0, 500) : DEFAULT_SETTINGS.hashtagsInstagram,
    hashtagsTiktok: typeof o.hashtagsTiktok === 'string' ? o.hashtagsTiktok.slice(0, 500) : DEFAULT_SETTINGS.hashtagsTiktok,
    remindersOn: o.remindersOn === true,
    reminderTime: typeof o.reminderTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(o.reminderTime) ? o.reminderTime : DEFAULT_SETTINGS.reminderTime,
    remindedFollowUps: reminded
  };
}

function hashtagsFor(platform) {
  return (platform === 'TikTok' ? settings.hashtagsTiktok : settings.hashtagsInstagram).trim();
}

// Kept as separate names so call sites read naturally; all three land in the same store.
function saveClips() { persist(); }

function saveBrands() { persist(); }

function saveTasks() { persist(); }

function uid() { return 'c' + Date.now() + Math.floor(Math.random()*1000); }

function uidBrand() { return 'b' + Date.now() + Math.floor(Math.random()*1000); }

function uidTask() { return 't' + Date.now() + Math.floor(Math.random()*1000); }

// ===== Validation =====
// Stored data and imported backups are both untrusted input: coerce every field to the shape the
// app expects so a bad or hand-edited file can't inject markup or break rendering.
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function str(v, max) { return typeof v === 'string' ? v.slice(0, max || 5000) : ''; }

function strList(v, allowed) {
  if (!Array.isArray(v)) return [];
  return v.filter(x => typeof x === 'string' && (!allowed || allowed.includes(x))).slice(0, 50);
}

function safeId(v, make) { return typeof v === 'string' && SAFE_ID.test(v) ? v : make(); }

function safeDay(v) { return typeof v === 'string' && ISO_DAY.test(v) ? v : ''; }

function safeIso(v) { return typeof v === 'string' && !isNaN(Date.parse(v)) ? v : new Date().toISOString(); }

function safeUrl(v) { return typeof v === 'string' && /^https?:\/\//i.test(v) ? v.slice(0, 2000) : ''; }

function normalizeClip(c) {
  if (!c || typeof c !== 'object') return null;
  const tones = strList(c.selectedTones, TONES);
  let captions = null;
  if (c.captions && typeof c.captions === 'object' && Array.isArray(c.captions.captions)) {
    captions = {
      captions: strList(c.captions.captions).map(s => s.slice(0, 2000)),
      hashtagsInstagram: str(c.captions.hashtagsInstagram || c.captions.hashtags, 500),
      hashtagsTiktok: str(c.captions.hashtagsTiktok || c.captions.hashtags, 500)
    };
  }
  return {
    id: safeId(c.id, uid),
    desc: str(c.desc, 2000),
    status: STATUSES.includes(c.status) ? c.status : 'idea',
    created: safeIso(c.created),
    scheduledDate: safeDay(c.scheduledDate),
    selectedTones: tones.length ? tones : ['Deadpan nature-doc'],
    platform: PLATFORMS.includes(c.platform) ? c.platform : 'Both',
    captionTones: strList(c.captionTones, TONES),
    captions,
    videoLink: safeUrl(c.videoLink),
    brandId: typeof c.brandId === 'string' && SAFE_ID.test(c.brandId) ? c.brandId : '',
    catTags: strList(c.catTags, CATS),
    archived: c.archived === true
  };
}

function normalizeBrand(b) {
  if (!b || typeof b !== 'object' || !str(b.name).trim()) return null;
  return {
    id: safeId(b.id, uidBrand),
    name: str(b.name, 200),
    category: str(b.category, 200),
    status: BRAND_STATUSES.some(s => s.key === b.status) ? b.status : 'researching',
    contact: str(b.contact, 500),
    product: str(b.product, 500),
    date: safeDay(b.date),
    notes: str(b.notes, 5000),
    updatedAt: b.updatedAt ? safeIso(b.updatedAt) : null
  };
}

function normalizeTask(t) {
  if (!t || typeof t !== 'object' || !str(t.text).trim()) return null;
  return {
    id: safeId(t.id, uidTask),
    text: str(t.text, 1000),
    done: t.done === true,
    brandId: typeof t.brandId === 'string' && SAFE_ID.test(t.brandId) ? t.brandId : ''
  };
}

function normalizeList(list, fn) {
  return Array.isArray(list) ? list.map(fn).filter(Boolean) : [];
}

function seedData() {
  clips = SEED_CLIPS.map(c => normalizeClip({ id: uid(), created: new Date().toISOString(), ...c }));
  brands = [
    { id: uidBrand(), ...SEED_STRATEGY_NOTE },
    ...SEED_BRANDS.map(b => ({ id: uidBrand(), ...b }))
  ].map(normalizeBrand);
  tasks = SEED_TASKS.map(text => normalizeTask({ id: uidTask(), text, done: false }));
}

async function loadAll() {
  const stored = await readStore();
  if (stored) {
    clips = normalizeList(stored.clips, normalizeClip);
    brands = normalizeList(stored.brands, normalizeBrand);
    tasks = normalizeList(stored.tasks, normalizeTask);
    settings = normalizeSettings(stored.settings);
    setSyncStatus('Saved on this device');
  } else {
    seedData();
    await writeStore();
  }
  // Ask the browser not to evict our data under storage pressure (no-op where unsupported).
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  refreshAllBrandDropdowns();
  render();
  maybeShowOnboarding();
  scheduleReminderSync();
}
