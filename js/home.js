// Render loop, header and bottom bar, global search, and the Home view.

const VIEW_IDS = { home: 'homeView', bank: 'bankView', plan: 'calendarView', library: 'libraryView', outreach: 'outreachView', search: 'searchView' };

function goTo(view) {
  if (searchOpen) closeSearch();
  currentView = view;
  window.scrollTo(0, 0);
  render();
}

function render() {
  const searching = searchOpen && !!searchQuery;
  const active = searching ? 'search' : currentView;
  document.body.classList.toggle('view-calendar-full', active === 'plan' && isMobile());
  if (typeof syncHeaderSpacing === 'function') requestAnimationFrame(syncHeaderSpacing);

  renderHeaderNav();
  const titles = { home: 'TwoStoryTails', bank: 'Caption bank', plan: 'Plan', library: 'Library', outreach: 'Outreach', search: 'Search' };
  document.getElementById('pageTitle').textContent = titles[active] || 'TwoStoryTails';
  renderSearchPanel();

  Object.entries(VIEW_IDS).forEach(([view, id]) => { document.getElementById(id).hidden = view !== active; });
  const viewChanged = active !== lastAnimatedView;
  lastAnimatedView = active;

  if (active === 'home') renderHome();
  else if (active === 'bank') renderBank();
  else if (active === 'library') renderLibrary();
  else if (active === 'plan') renderCalendar();
  else if (active === 'search') renderSearchResults();
  else if (active === 'outreach') { renderOutreachTabs(); renderOutreach(); }

  refreshOpenModal();
  if (viewChanged) playViewAnim(document.getElementById(VIEW_IDS[active]));
}

function renderHeaderNav() {
  const nav = document.getElementById('headerNav');
  if (!nav) return;
  nav.innerHTML = '';
  ['home', 'bank', '__add__', 'plan', 'library'].forEach(v => {
    if (v === '__add__') {
      const addBtn = document.createElement('button');
      addBtn.className = 'nav-add-btn';
      addBtn.id = 'fabAddBtn';
      addBtn.setAttribute('aria-label', 'New caption');
      addBtn.title = 'New caption';
      addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      addBtn.onclick = handleFabAddClick;
      nav.appendChild(addBtn);
      return;
    }
    const btn = document.createElement('button');
    btn.className = currentView === v ? 'active' : '';
    btn.dataset.view = v;
    btn.title = VIEW_META[v].label;
    btn.innerHTML = VIEW_META[v].icon + '<span class="nav-label">' + VIEW_META[v].navLabel + '</span>';
    btn.onclick = () => {
      // Tapping Bank again from inside a folder goes back to the folders
      if (v === 'bank' && currentView === 'bank') bankPillar = '';
      goTo(v);
    };
    nav.appendChild(btn);
  });
}

// ===== Search: one box in the header that looks through everything =====

function renderSearchPanel() {
  document.getElementById('quickFilterPanel').hidden = !searchOpen;
  document.getElementById('searchToggleBtn').classList.toggle('filter-icon-active', searchOpen);
}

function openSearch() {
  searchOpen = true;
  render();
  setTimeout(() => document.getElementById('searchInput').focus(), 50);
}

function closeSearch() {
  searchOpen = false;
  searchQuery = '';
  document.getElementById('searchInput').value = '';
}

function clipMatches(c, q) {
  if (c.desc.toLowerCase().includes(q)) return true;
  if (c.catTags.some(cat => cat.toLowerCase().includes(q))) return true;
  if (pillarOf(c.pillar).label.toLowerCase().includes(q)) return true;
  const brand = c.brandId && brands.find(b => b.id === c.brandId);
  if (brand && brand.name.toLowerCase().includes(q)) return true;
  return !!(c.captions && c.captions.captions.some(cap => cap.toLowerCase().includes(q)));
}

const SEARCH_LIMIT = 50;

function renderSearchResults() {
  const el = document.getElementById('searchView');
  const q = searchQuery.toLowerCase();
  const order = { idea: 0, planned: 1, posted: 2 };
  const hits = clips.filter(c => clipMatches(c, q))
    .sort((a, b) => (a.archived - b.archived) || (order[a.status] - order[b.status]));
  const brandHits = brands.filter(b => !isPinnedBrand(b) && b.name.toLowerCase().includes(q));
  el.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'block-head';
  head.innerHTML = '<h2 class="block-title">' + hits.length + ' caption' + (hits.length === 1 ? '' : 's') + '</h2>';
  el.appendChild(head);
  if (!hits.length && !brandHits.length) {
    el.insertAdjacentHTML('beforeend', '<div class="empty-state">Nothing matches "' + escapeHtml(searchQuery) + '".</div>');
    return;
  }
  const list = document.createElement('div');
  list.className = 'clip-rows';
  hits.slice(0, SEARCH_LIMIT).forEach(c => list.appendChild(buildClipRow(c, { showStage: true })));
  el.appendChild(list);
  if (hits.length > SEARCH_LIMIT) el.insertAdjacentHTML('beforeend', '<p class="list-note">Showing the first ' + SEARCH_LIMIT + '. Keep typing to narrow it down.</p>');
  if (brandHits.length) {
    const bh = document.createElement('div');
    bh.className = 'block-head';
    bh.innerHTML = '<h2 class="block-title">Brands</h2>';
    el.appendChild(bh);
    brandHits.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ghost search-brand';
      btn.textContent = b.name + ' · ' + ((BRAND_STATUSES.find(x => x.key === b.status) || {}).label || '');
      btn.onclick = () => { outreachTab = 'brands'; brandTab = b.status; goTo('outreach'); };
      el.appendChild(btn);
    });
  }
}

document.getElementById('searchIcon').innerHTML = NAV_ICONS.search;

document.getElementById('searchToggleBtn').innerHTML = NAV_ICONS.search;

document.getElementById('searchToggleBtn').addEventListener('click', () => {
  if (searchOpen) { closeSearch(); render(); } else openSearch();
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  render();
});

// ===== Home: this week, up next, one idea from the bank, outreach =====

function isOverdue(clip) {
  return clip.status !== 'posted' && !!clip.scheduledDate && clip.scheduledDate < localToday();
}

// Planned posts, dated ones soonest first (so overdue ones lead), then undated ones
function plannedQueue() {
  return clips.filter(c => !c.archived && c.status === 'planned')
    .sort((a, b) => {
      if (!!a.scheduledDate !== !!b.scheduledDate) return a.scheduledDate ? -1 : 1;
      return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
    });
}

function bankIdeas(pillar) {
  return clips.filter(c => !c.archived && c.status === 'idea' && (!pillar || c.pillar === pillar));
}

function renderHome() {
  renderHomeStats();
  renderUpNext();
  renderCaptionOfTheDay();
  renderOutreachCard();
}

const UP_NEXT_MAX = 3;

function renderUpNext() {
  const el = document.getElementById('upNextList');
  el.innerHTML = '';
  const queue = plannedQueue();
  if (!queue.length) {
    el.innerHTML = '<div class="empty-card">Nothing planned yet. Pick something from the bank below, or tap + to add one.</div>';
  } else {
    queue.slice(0, UP_NEXT_MAX).forEach(c => el.appendChild(buildStackCard(c)));
  }
  const more = queue.length - UP_NEXT_MAX;
  const btn = document.getElementById('upNextAllBtn');
  btn.textContent = more > 0 ? '+' + more + ' more on the plan ›' : 'See plan ›';
}

// One idea a day from the bank, the same one all day until you shuffle
let cotdShuffle = 0;

function captionOfTheDay() {
  const ideas = bankIdeas();
  if (!ideas.length) return null;
  let h = 0;
  for (const ch of localToday()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ideas[(h + cotdShuffle) % ideas.length];
}

function renderCaptionOfTheDay() {
  const el = document.getElementById('cotdCard');
  const clip = captionOfTheDay();
  if (!clip) {
    el.innerHTML = '<div class="empty-card">The bank is empty. Tap + whenever a line pops into your head.</div>';
    return;
  }
  const n = bankIdeas().length;
  el.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'cotd surface c' + clipColorIndex(clip);
  card.innerHTML =
    '<div class="cotd-top">' + pillarChipHtml(clip.pillar) + '<span class="cotd-count">' + n + ' in the bank</span></div>' +
    '<p class="cotd-text">' + escapeHtml(clip.desc) + '</p>' +
    '<div class="cotd-actions">' +
      '<button type="button" class="ghost" data-act="shuffle">Shuffle</button>' +
      '<button type="button" class="ghost" data-act="copy">Copy</button>' +
      '<button type="button" data-act="plan">Plan it</button>' +
    '</div>';
  card.querySelector('[data-act="shuffle"]').onclick = () => {
    cotdShuffle++;
    renderCaptionOfTheDay();
    const fresh = document.querySelector('#cotdCard .cotd');
    if (fresh && !prefersReducedMotion()) fresh.animate([{ transform: 'rotate(-2deg) scale(0.96)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.9,.25,1)' });
  };
  card.querySelector('[data-act="copy"]').onclick = (e) => copyText(clip.desc, e.currentTarget);
  card.querySelector('[data-act="plan"]').onclick = () => openCardModal(clip.id);
  el.appendChild(card);
}

function renderOutreachCard() {
  const el = document.getElementById('outreachCard');
  const pipeline = brands.filter(b => !isPinnedBrand(b));
  const waiting = pipeline.filter(b => b.status === 'waiting');
  const due = waiting.filter(b => (daysSince(b.date || b.updatedAt) || 0) >= 14).length;
  const openTasks = tasks.filter(t => !t.done).length;
  const bits = [waiting.length + ' waiting to hear back', openTasks + ' to-do' + (openTasks === 1 ? '' : 's')];
  el.innerHTML =
    '<span class="outreach-card-icon">' + NAV_ICONS.outreach + '</span>' +
    '<span class="outreach-card-main"><span class="card-kicker">Brand outreach</span>' +
    '<span class="outreach-card-line">' + escapeHtml(bits.join(' · ')) + '</span>' +
    (due ? '<span class="outreach-card-due">⏰ ' + due + ' follow-up' + (due === 1 ? '' : 's') + ' due</span>' : '') +
    '</span><span class="outreach-card-go">›</span>';
}

document.getElementById('outreachCard').addEventListener('click', () => goTo('outreach'));

document.getElementById('upNextAllBtn').addEventListener('click', () => goTo('plan'));

// Only re-render when crossing the phone/desktop line: the keyboard opening also fires resize,
// and a re-render then would rebuild (and blur) whatever is being typed in
let wasMobile = isMobile();

window.addEventListener('resize', () => {
  syncHeaderSpacing();
  if (isMobile() !== wasMobile) { wasMobile = isMobile(); render(); }
});

// ===== Fixed header: reserve space for it below, and hide/show based on scroll direction =====

function syncHeaderSpacing() {
  const header = document.getElementById('mainHeader');
  const wrap = document.querySelector('.wrap');
  if (!header || !wrap) return;
  wrap.style.setProperty('padding-top', (header.offsetHeight + 14) + 'px', 'important');
}

window.addEventListener('load', syncHeaderSpacing);
// The header changes height when search opens or Capacitor reports the status bar size
if (window.ResizeObserver) new ResizeObserver(() => syncHeaderSpacing()).observe(document.getElementById('mainHeader'), { box: 'border-box' });

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  const y = window.scrollY;
  if (y <= 0) {
    header.classList.remove('header-hidden');
  } else if (y > lastScrollY && y > header.offsetHeight && !searchOpen) {
    header.classList.add('header-hidden');
  } else if (y < lastScrollY) {
    header.classList.remove('header-hidden');
  }
  lastScrollY = y;
}, { passive: true });
