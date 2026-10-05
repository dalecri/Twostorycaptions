// Home: render loop, header and nav, search and status chips, ordering, multi-select, sticky header.

function render() {
  const mobile = isMobile();
  document.body.classList.toggle('view-calendar-full', currentView === 'calendar' && mobile);
  if (typeof syncHeaderSpacing === 'function') requestAnimationFrame(syncHeaderSpacing);

  renderHeaderNav();
  const pageTitles = { grid: 'Home', calendar: 'Calendar', outreach: 'Brands', templates: 'Templates', tasks: 'Tasks' };
  document.getElementById('pageTitle').textContent = pageTitles[currentView] || 'Home';

  const isOutreachFamily = currentView === 'outreach' || currentView === 'templates' || currentView === 'tasks';
  document.getElementById('outreachView').style.display = isOutreachFamily ? 'block' : 'none';

  const showList = currentView === 'grid';
  const showClipFilters = showList || currentView === 'calendar';
  document.getElementById('headerFilterIcons').style.display = showClipFilters ? 'flex' : 'none';
  const calBtn = document.getElementById('calendarToggleBtn');
  const homeIcon = gridLayoutMode === 'list' ? NAV_ICONS.list : NAV_ICONS.stack;
  calBtn.innerHTML = currentView === 'calendar' ? homeIcon : NAV_ICONS.calendar;
  calBtn.title = currentView === 'calendar' ? 'Back to captions' : 'Calendar view';
  if (!showClipFilters) {
    activeQuickFilter = null;
  }
  if (!showList && selectMode) {
    selectMode = false;
    selectedClipIds.clear();
    document.getElementById('selectionBar').style.display = 'none';
  }
  renderQuickFilterPanel();
  if (showClipFilters) renderStatusFilterSelect();

  const viewChanged = currentView !== lastAnimatedView;
  lastAnimatedView = currentView;

  if (currentView !== 'grid') document.getElementById('homeStats').hidden = true;
  if (isOutreachFamily) {
    document.getElementById('cardList').style.display = 'none';
    document.getElementById('calendarView').style.display = 'none';
    switchOutreachSubView(currentView === 'outreach' ? 'pipeline' : currentView);
    renderOutreach();
    if (viewChanged) playViewAnim(document.getElementById('outreachView'));
    return;
  }

  document.getElementById('cardList').style.display = showList ? (gridLayoutMode === 'stack' ? 'block' : 'grid') : 'none';
  document.getElementById('calendarView').style.display = currentView === 'calendar' ? 'block' : 'none';

  if (currentView === 'calendar') {
    renderCalendar();
    renderTally();
    refreshOpenModal();
    if (viewChanged) playViewAnim(document.getElementById('calendarView'));
    return;
  }

  renderHomeStats();
  renderCardListOnly();
  renderTally();
  refreshOpenModal();
  if (viewChanged) playViewAnim(document.getElementById('cardList'));
}

// One row of status chips under the search box (cats and brands are found by searching)
function renderStatusFilterSelect() {
  const row = document.getElementById('filterRow');
  if (!row) return;
  const active = clips.filter(c => !c.archived);
  const archivedCount = clips.length - active.length;
  const options = [['all', 'All', active.length]]
    .concat(STATUSES.map(st => [st, STATUS_LABELS[st], active.filter(c => c.status === st).length]));
  if (archivedCount || activeFilter === 'archived') options.push(['archived', 'Archived', archivedCount]);
  row.innerHTML = '';
  options.forEach(([key, label, n]) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (activeFilter === key ? ' selected' : '');
    chip.setAttribute('aria-pressed', activeFilter === key ? 'true' : 'false');
    chip.innerHTML = escapeHtml(label) + ' <span class="chip-count">' + n + '</span>';
    chip.onclick = () => { activeFilter = key; render(); };
    row.appendChild(chip);
  });
}

function toggleQuickFilter(type) {
  activeQuickFilter = activeQuickFilter === type ? null : type;
  renderQuickFilterPanel();
  if (activeQuickFilter === 'search') {
    setTimeout(() => document.getElementById('searchInput').focus(), 50);
  }
}

function renderQuickFilterPanel() {
  const panel = document.getElementById('quickFilterPanel');
  panel.style.display = activeQuickFilter ? 'block' : 'none';
  document.getElementById('searchToggleBtn').classList.toggle('filter-icon-active', !!activeQuickFilter);
}

function getFilteredClips() {
  let list = clips;
  if (activeFilter === 'archived') {
    list = list.filter(c => c.archived);
  } else {
    list = list.filter(c => !c.archived);
    if (activeFilter !== 'all') list = list.filter(c => c.status === activeFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c => {
      if (c.desc && c.desc.toLowerCase().includes(q)) return true;
      if ((c.catTags || []).some(cat => cat.toLowerCase().includes(q))) return true;
      const brand = c.brandId && brands.find(b => b.id === c.brandId);
      if (brand && brand.name.toLowerCase().includes(q)) return true;
      if (c.captions) {
        if (c.captions.hook && c.captions.hook.toLowerCase().includes(q)) return true;
        if (Array.isArray(c.captions.captions) && c.captions.captions.some(cap => cap.toLowerCase().includes(q))) return true;
      }
      return false;
    });
  }
  return list;
}

function isOverdue(clip) {
  return clip.status !== 'posted' && !!clip.scheduledDate && clip.scheduledDate < localToday();
}

// Home answers "what do I post next?": dated posts soonest first (overdue on top), then
// captioned, filmed and ideas, with posted ones last (newest first).
function upNextRank(clip) {
  if (clip.status === 'posted') return 4;
  if (clip.scheduledDate) return 0;
  return { captioned: 1, filmed: 2 }[clip.status] || 3;
}

function sortUpNext(list) {
  return list
    .map((clip, i) => ({ clip, i, rank: upNextRank(clip) }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.rank === 0) return a.clip.scheduledDate.localeCompare(b.clip.scheduledDate);
      if (a.rank === 4) return (b.clip.scheduledDate || '').localeCompare(a.clip.scheduledDate || '') || a.i - b.i;
      return a.i - b.i;
    })
    .map(x => x.clip);
}

function renderCardListOnly() {
  const list = document.getElementById('cardList');
  if (!list) return;
  list.innerHTML = '';
  list.className = 'cardlist-' + gridLayoutMode;
  if (list.style.display !== 'none') list.style.display = gridLayoutMode === 'stack' ? 'block' : 'grid';
  const filtered = sortUpNext(getFilteredClips());

  if (filtered.length === 0) {
    if (searchQuery || activeFilter !== 'all') {
      list.innerHTML = '<div class="empty-state">Nothing matches that search/filter.</div>';
    } else {
      list.innerHTML = '<div class="empty-state">No captions logged yet. The field is quiet.</div>';
    }
  } else {
    let prevColor = -1;
    filtered.forEach((clip, i) => {
      if (gridLayoutMode === 'list') { list.appendChild(buildListTile(clip)); return; }
      // Stable color per clip, nudged when it would match the card right above it
      let color = clipColorIndex(clip);
      if (color === prevColor) color = (color + 1) % 7;
      prevColor = color;
      list.appendChild(buildStackCard(clip, i, color));
    });
    syncStackTop();
  }
}

// ===== Mass select / delete =====

function toggleSelectMode() {
  selectMode = !selectMode;
  if (!selectMode) selectedClipIds.clear();
  document.getElementById('selectionBar').style.display = selectMode ? 'flex' : 'none';
  renderSelectionBar();
  renderHomeStats();
  renderCardListOnly();
}

function toggleClipSelection(id) {
  if (selectedClipIds.has(id)) selectedClipIds.delete(id); else selectedClipIds.add(id);
  renderSelectionBar();
  renderCardListOnly();
}

function renderSelectionBar() {
  const countEl = document.getElementById('selectionCount');
  const deleteBtn = document.getElementById('deleteSelectedBtn');
  const bulkStatusSelect = document.getElementById('bulkStatusSelect');
  const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
  if (!countEl) return;
  const n = selectedClipIds.size;
  countEl.textContent = n + ' selected';
  deleteBtn.disabled = n === 0;
  if (bulkStatusSelect) bulkStatusSelect.disabled = n === 0;
  if (bulkArchiveBtn) bulkArchiveBtn.disabled = n === 0;
}

function selectAllVisible() {
  getFilteredClips().forEach(c => selectedClipIds.add(c.id));
  renderSelectionBar();
  renderCardListOnly();
}

async function bulkSetStatus(status) {
  const ids = Array.from(selectedClipIds);
  if (!ids.length || !status) return;
  ids.forEach(id => {
    const c = clips.find(c => c.id === id);
    if (c) c.status = status;
  });
  render();
  await Promise.all(ids.map(id => saveClips(id)));
  document.getElementById('bulkStatusSelect').value = '';
}

async function bulkArchiveSelected() {
  const ids = Array.from(selectedClipIds);
  if (!ids.length) return;
  const changed = clips.filter(c => ids.includes(c.id) && !c.archived);
  changed.forEach(c => { c.archived = true; });
  exitSelectMode();
  render();
  saveClips();
  showToast(changed.length + ' card' + (changed.length === 1 ? '' : 's') + ' archived', {
    onUndo: () => { changed.forEach(c => { c.archived = false; }); saveClips(); render(); }
  });
}

async function deleteSelectedClips() {
  const ids = Array.from(selectedClipIds);
  if (!ids.length) return;
  exitSelectMode();
  removeWithUndo(clips, ids, ids.length + ' card' + (ids.length === 1 ? '' : 's') + ' deleted', saveClips, render);
}

function exitSelectMode() {
  selectedClipIds.clear();
  selectMode = false;
  document.getElementById('selectionBar').style.display = 'none';
}

function renderHeaderNav() {
  const nav = document.getElementById('headerNav');
  if (!nav) return;
  nav.innerHTML = '';
  ['grid','outreach', '__add__', 'templates','tasks'].forEach(v => {
    if (v === '__add__') {
      const addBtn = document.createElement('button');
      addBtn.className = 'nav-add-btn';
      addBtn.id = 'fabAddBtn';
      addBtn.setAttribute('aria-label', 'Add');
      addBtn.title = 'Add';
      addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      addBtn.onclick = handleFabAddClick;
      nav.appendChild(addBtn);
      return;
    }
    const btn = document.createElement('button');
    btn.className = currentView === v ? 'active' : '';
    btn.title = VIEW_META[v].label;
    btn.innerHTML = VIEW_META[v].icon + '<span class="nav-label">' + VIEW_META[v].navLabel + '</span>';
    btn.onclick = () => { currentView = v; render(); };
    nav.appendChild(btn);
  });
}

function renderTally() {
  const posted = clips.filter(c => c.status === 'posted').length;
  const pending = clips.length - posted;
  document.getElementById('tally').innerHTML =
    '<span>' + pending + ' pending in the field</span><span>' + posted + ' catalogued (posted)</span>';
}

document.getElementById('searchIcon').innerHTML = NAV_ICONS.search;

document.getElementById('calendarToggleBtn').addEventListener('click', () => {
  currentView = currentView === 'calendar' ? 'grid' : 'calendar';
  render();
});

document.getElementById('searchToggleBtn').innerHTML = NAV_ICONS.search;

document.getElementById('searchToggleBtn').addEventListener('click', () => toggleQuickFilter('search'));

// Home layout lives in Settings: Deck (stacked cards) / List
function renderLayoutToggle() {
  const row = document.getElementById('settingsLayoutRow');
  if (!row) return;
  const labels = { stack: 'Deck', list: 'List' };
  row.innerHTML = '';
  LAYOUT_MODES.forEach(mode => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = mode === gridLayoutMode ? '' : 'ghost';
    btn.textContent = labels[mode];
    btn.onclick = () => {
      gridLayoutMode = mode;
      try { localStorage.setItem('ttt-layout-mode-v2', gridLayoutMode); } catch (e) {}
      renderLayoutToggle();
      render();
    };
    row.appendChild(btn);
  });
}

document.getElementById('selectAllBtn').addEventListener('click', selectAllVisible);

document.getElementById('cancelSelectBtn').addEventListener('click', toggleSelectMode);

document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelectedClips);

STATUSES.forEach(s => {
  const opt = document.createElement('option');
  opt.value = s;
  opt.textContent = STATUS_LABELS[s];
  document.getElementById('bulkStatusSelect').appendChild(opt);
});

document.getElementById('bulkStatusSelect').addEventListener('change', (e) => bulkSetStatus(e.target.value));

document.getElementById('bulkArchiveBtn').addEventListener('click', bulkArchiveSelected);

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderHomeStats();
  renderCardListOnly();
});

window.addEventListener('resize', () => { render(); syncHeaderSpacing(); });

// ===== Fixed header: reserve space for it below, and hide/show based on scroll direction =====

function syncHeaderSpacing() {
  const header = document.getElementById('mainHeader');
  const wrap = document.querySelector('.wrap');
  if (!header || !wrap) return;
  wrap.style.setProperty('padding-top', (header.offsetHeight + 16) + 'px', 'important');
  syncStackTop();
}

// Stacked cards pile up just under the header, or at the very top while the header is scrolled away.
function syncStackTop() {
  const header = document.getElementById('mainHeader');
  const list = document.getElementById('cardList');
  if (!header || !list) return;
  const hidden = header.classList.contains('header-hidden');
  list.style.setProperty('--stack-top', (hidden ? 12 : header.offsetHeight + 12) + 'px');
}

window.addEventListener('load', syncHeaderSpacing);

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  const y = window.scrollY;
  if (y <= 0) {
    header.classList.remove('header-hidden');
  } else if (y > lastScrollY && y > header.offsetHeight) {
    header.classList.add('header-hidden');
  } else if (y < lastScrollY) {
    header.classList.remove('header-hidden');
  }
  lastScrollY = y;
  syncStackTop();
}, { passive: true });
