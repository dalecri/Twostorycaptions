// Library: everything that's been posted, as a 3-across grid like the Instagram profile.
// Filter by cat or pillar with one tap; tiles load a page at a time.

const LIBRARY_PAGE = 30;

function libraryItems() {
  return clips
    .filter(c => (libraryArchived ? c.archived : !c.archived && c.status === 'posted'))
    .filter(c => !libraryCat || c.catTags.includes(libraryCat))
    .filter(c => !libraryPillar || c.pillar === libraryPillar)
    // Newest first; undated (imported) ones keep their saved order after the dated ones
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (b.c.scheduledDate || '').localeCompare(a.c.scheduledDate || '') || a.i - b.i)
    .map(x => x.c);
}

function setLibraryFilter(kind, value) {
  if (kind === 'cat') libraryCat = libraryCat === value ? '' : value;
  if (kind === 'pillar') libraryPillar = libraryPillar === value ? '' : value;
  if (kind === 'archived') libraryArchived = !libraryArchived;
  libraryShown = LIBRARY_PAGE;
  render();
}

function renderLibrary() {
  const el = document.getElementById('libraryView');
  el.innerHTML = '';
  const items = libraryItems();
  const allPosted = clips.filter(c => !c.archived && c.status === 'posted').length;
  const archived = clips.filter(c => c.archived).length;

  // Cats as avatars, pillars as small colour dots: one row each, no typing
  const filters = document.createElement('div');
  filters.className = 'lib-filters';
  const catRow = document.createElement('div');
  catRow.className = 'lib-cat-row';
  CATS.forEach(cat => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lib-cat' + (libraryCat === cat ? ' selected' : '');
    b.setAttribute('aria-pressed', libraryCat === cat ? 'true' : 'false');
    b.innerHTML = '<span class="cat-avatar">' + catAvatarSvg(cat) + '</span><span>' + escapeHtml(cat) + '</span>';
    b.onclick = () => setLibraryFilter('cat', cat);
    catRow.appendChild(b);
  });
  filters.appendChild(catRow);
  const pillarRow = document.createElement('div');
  pillarRow.className = 'chip-row lib-pillar-row';
  PILLARS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip lib-pillar c' + p.color + (libraryPillar === p.key ? ' selected' : '');
    b.setAttribute('aria-pressed', libraryPillar === p.key ? 'true' : 'false');
    b.innerHTML = '<span class="pillar-dot" aria-hidden="true"></span>' + escapeHtml(p.label);
    b.onclick = () => setLibraryFilter('pillar', p.key);
    pillarRow.appendChild(b);
  });
  if (archived || libraryArchived) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (libraryArchived ? ' selected' : '');
    b.setAttribute('aria-pressed', libraryArchived ? 'true' : 'false');
    b.innerHTML = NAV_ICONS.archive + 'Archived <span class="chip-count">' + archived + '</span>';
    b.onclick = () => setLibraryFilter('archived');
    pillarRow.appendChild(b);
  }
  filters.appendChild(pillarRow);
  el.appendChild(filters);

  const filtered = libraryCat || libraryPillar || libraryArchived;
  const head = document.createElement('div');
  head.className = 'block-head';
  head.innerHTML = '<h2 class="block-title">' + (filtered ? items.length + ' of ' + allPosted : allPosted) + ' post' + (allPosted === 1 ? '' : 's') + (libraryArchived ? ' archived' : '') + '</h2>';
  if (filtered) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'link-btn';
    clear.textContent = 'Clear ✕';
    clear.onclick = () => { libraryCat = ''; libraryPillar = ''; libraryArchived = false; libraryShown = LIBRARY_PAGE; render(); };
    head.appendChild(clear);
  }
  el.appendChild(head);

  if (!items.length) {
    el.insertAdjacentHTML('beforeend', '<div class="empty-card">' + (filtered ? 'Nothing posted with that combo yet.' : 'Posted captions land here. Mark a card Posted, or import your history from Settings.') + '</div>');
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'lib-grid';
  items.slice(0, libraryShown).forEach(c => grid.appendChild(buildLibraryTile(c)));
  el.appendChild(grid);

  if (items.length > libraryShown) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'ghost lib-more';
    more.textContent = 'Show more (' + (items.length - libraryShown) + ' left)';
    more.onclick = () => { libraryShown += LIBRARY_PAGE; renderLibrary(); };
    el.appendChild(more);
  }
}

function buildLibraryTile(clip) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'lib-tile c' + clipColorIndex(clip);
  tile.setAttribute('data-highlight-id', clip.id);
  const dots = clip.catTags.map(c => '<span class="cat-dot" style="--cat-color:' + CAT_PROFILES[c].bg + '"></span>').join('');
  tile.innerHTML =
    '<span class="lib-tile-icon">' + pillarIconSvg(clip.pillar) + '</span>' +
    '<span class="lib-tile-text">' + escapeHtml(clip.desc || 'Untitled') + '</span>' +
    (dots ? '<span class="lib-tile-cats">' + dots + '</span>' : '');
  tile.title = clip.desc;
  tile.onclick = () => openCardModal(clip.id, tile);
  return tile;
}
