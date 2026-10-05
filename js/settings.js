// Settings sheet: theme, goal, hashtags, backups (export / import).

// Android status bar icons: dark on light themes, light on dark ones (Capacitor SystemBars)
function syncStatusBarStyle(background) {
  const cap = window.Capacitor;
  const bars = cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.SystemBars;
  if (!bars) return;
  const hex = background.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const light = (0.299 * r + 0.587 * g + 0.114 * b) > 140;
  try { bars.setStyle({ style: light ? 'LIGHT' : 'DARK' }); } catch (e) {}
}

function applyTheme(name, skipSave) {
  if (!THEMES[name]) name = 'marina';
  currentTheme = name;
  const theme = THEMES[name];
  syncStatusBarStyle(theme.vars['--paper']);
  const root = document.documentElement.style;
  Object.entries(theme.vars).forEach(([k, v]) => root.setProperty(k, v));
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme.vars['--paper']);
  if (!skipSave) {
    try { localStorage.setItem('ttt-theme', name); } catch (e) {}
  }
  renderThemePicker();
}

function renderThemePicker() {
  const grid = document.getElementById('settingsThemeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.keys(THEMES).forEach(key => {
    const theme = THEMES[key];
    const card = document.createElement('div');
    card.className = 'settings-theme-card' + (currentTheme === key ? ' selected' : '');
    const pair = document.createElement('div');
    pair.className = 'theme-swatch-pair';
    theme.swatches.forEach(hex => {
      const sw = document.createElement('div');
      sw.style.background = hex;
      pair.appendChild(sw);
    });
    const label = document.createElement('span');
    label.className = 'theme-option-label';
    label.textContent = theme.label;
    card.appendChild(pair);
    card.appendChild(label);
    card.onclick = () => applyTheme(key);
    grid.appendChild(card);
  });
}

function openSettingsModal() {
  document.getElementById('settingsModalOverlay').classList.add('open');
  renderThemePicker();
  renderSettingsPrefs();
}

function renderSettingsPrefs() {
  const goalRow = document.getElementById('settingsGoalRow');
  goalRow.innerHTML = '';
  for (let n = 1; n <= 7; n++) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (settings.weeklyGoal === n ? ' selected' : '');
    chip.setAttribute('aria-pressed', settings.weeklyGoal === n ? 'true' : 'false');
    chip.textContent = n;
    chip.onclick = () => { settings.weeklyGoal = n; persist(); renderSettingsPrefs(); render(); };
    goalRow.appendChild(chip);
  }
  const ig = document.getElementById('settingsTagsIg');
  const tt = document.getElementById('settingsTagsTt');
  if (document.activeElement !== ig) ig.value = settings.hashtagsInstagram;
  if (document.activeElement !== tt) tt.value = settings.hashtagsTiktok;
  if (typeof renderReminderSettings === 'function') renderReminderSettings();
}

document.getElementById('settingsTagsIg').addEventListener('input', (e) => { settings.hashtagsInstagram = e.target.value; persist(); });

document.getElementById('settingsTagsTt').addEventListener('input', (e) => { settings.hashtagsTiktok = e.target.value; persist(); });

function closeSettingsModal() {
  document.getElementById('settingsModalOverlay').classList.remove('open');
}

document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);

document.getElementById('settingsModalClose').addEventListener('click', closeSettingsModal);

document.getElementById('settingsModalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'settingsModalOverlay') closeSettingsModal();
});

// ===== Backup: export / import all data =====

async function exportAllData() {
  const payload = {
    exportedFrom: 'TwoStoryCaptions',
    exportedAt: new Date().toISOString(),
    clips,
    brands,
    tasks,
    settings
  };
  const json = JSON.stringify(payload, null, 2);
  const filename = 'twostorycaptions-backup-' + new Date().toISOString().slice(0, 10) + '.json';

  // In the Capacitor app, <a download> does nothing — write the file and open the share sheet instead.
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Share } = window.Capacitor.Plugins;
      const { uri } = await Filesystem.writeFile({ path: filename, data: json, directory: 'CACHE', encoding: 'utf8' });
      await Share.share({ title: 'TwoStoryCaptions backup', files: [uri] });
      setSyncStatus('Backup exported ✓');
    } catch (e) {
      if (!/cancel/i.test(e && e.message || '')) setSyncStatus('Export failed: ' + (e && e.message || e), true);
    }
    return;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setSyncStatus('Backup downloaded ✓');
}

// Upsert imported items: same id, or same content (so a fresh install's starter cards, brands
// and tasks don't end up duplicated next to the backup's copies), replaces; anything else is added.
// Returns { oldId: newId } for replaced items whose id changed, so links can follow them.
function mergeInto(list, incoming, keyOf) {
  const renamed = {};
  incoming.forEach(item => {
    const key = keyOf(item);
    const idx = list.findIndex(x => x.id === item.id || (key && keyOf(x) === key));
    if (idx > -1) {
      if (list[idx].id !== item.id) renamed[list[idx].id] = item.id;
      list[idx] = item;
    } else {
      list.push(item);
    }
  });
  return renamed;
}

async function handleImportFile(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    if (file.size > 20 * 1024 * 1024) throw new Error('File too large');
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object') throw new Error('Not an object');
    const inClips = normalizeList(data.clips, normalizeClip);
    const inBrands = normalizeList(data.brands, normalizeBrand);
    const inTasks = normalizeList(data.tasks, normalizeTask);
    if (!inClips.length && !inBrands.length && !inTasks.length) {
      alert("That file doesn't look like a TwoStoryCaptions backup — no captions, brands, or tasks found in it.");
      return;
    }
    const ok = confirm(
      `Import ${inClips.length} caption(s), ${inBrands.length} brand(s), and ${inTasks.length} task(s)?\n\n` +
      `This merges into what you already have — matching items get overwritten, everything else is added alongside it. Nothing is deleted.`
    );
    if (!ok) return;

    mergeInto(clips, inClips, c => c.desc.trim().toLowerCase());
    const brandIds = mergeInto(brands, inBrands, b => b.name.trim().toLowerCase());
    clips.concat(tasks).forEach(x => { if (brandIds[x.brandId]) x.brandId = brandIds[x.brandId]; });
    mergeInto(tasks, inTasks, t => t.text.trim().toLowerCase());
    // Goal and hashtags come along; reminder state stays with this device
    if (data.settings && typeof data.settings === 'object') {
      const imported = normalizeSettings(data.settings);
      settings = { ...settings, weeklyGoal: imported.weeklyGoal, hashtagsInstagram: imported.hashtagsInstagram, hashtagsTiktok: imported.hashtagsTiktok };
      renderSettingsPrefs();
    }
    await writeStore();

    refreshAllBrandDropdowns();
    render();
    alert(`Imported ${inClips.length} caption(s), ${inBrands.length} brand(s), ${inTasks.length} task(s).`);
  } catch (err) {
    console.error('Import failed', err);
    alert("Could not read that file — make sure it's a JSON backup exported from this app.");
  }
}

document.getElementById('exportBtn').addEventListener('click', exportAllData);

document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFileInput').click());

document.getElementById('importFileInput').addEventListener('change', handleImportFile);

function loadTheme() {
  let saved = 'marina';
  try { saved = localStorage.getItem('ttt-theme') || 'marina'; } catch (e) {}
  applyTheme(saved, true);
}
