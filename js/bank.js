// Caption bank: unposted ideas sorted into pillar folders. Open a folder for its ideas as
// compact rows, shuffle for a random one, or get fresh lines from the AI prompt.

function renderBank() {
  const el = document.getElementById('bankContent');
  el.innerHTML = '';
  // The AI prompt follows the open folder
  if (bankPillar && aiVibe !== pillarOf(bankPillar).label) { aiVibe = pillarOf(bankPillar).label; renderAiPromptPanel(); }
  if (bankPillar) renderPillarFolder(el, bankPillar);
  else renderPillarFolders(el);
}

// Opens a random idea (from one pillar, or the whole bank)
function surpriseIdea(pillar) {
  const ideas = bankIdeas(pillar);
  if (!ideas.length) { showToast('Nothing in here yet. Tap + to add one.'); return; }
  openCardModal(pickRandom(ideas, []).id);
}

function renderPillarFolders(el) {
  const total = bankIdeas().length;
  const top = document.createElement('div');
  top.className = 'bank-top';
  top.innerHTML = '<div><div class="bank-total"><strong>' + total + '</strong> idea' + (total === 1 ? '' : 's') + ' waiting</div>' +
    '<div class="bank-sub">Pick a pillar, or let fate decide</div></div>';
  const shuffle = document.createElement('button');
  shuffle.type = 'button';
  shuffle.className = 'shuffle-btn';
  shuffle.innerHTML = SHUFFLE_ICON + '<span>Surprise me</span>';
  shuffle.onclick = () => surpriseIdea('');
  top.appendChild(shuffle);
  el.appendChild(top);

  const grid = document.createElement('div');
  grid.className = 'pillar-grid';
  PILLARS.forEach(p => {
    const ideas = bankIdeas(p.key);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pillar-folder surface c' + p.color + (ideas.length ? '' : ' empty');
    btn.dataset.pillar = p.key;
    btn.innerHTML =
      '<span class="pillar-folder-icon">' + pillarIconSvg(p.key) + '</span>' +
      '<span class="pillar-folder-count">' + ideas.length + '</span>' +
      '<span class="pillar-folder-label">' + escapeHtml(p.label) + '</span>' +
      '<span class="pillar-folder-peek">' + escapeHtml(ideas.length ? ideas[0].desc : 'Empty for now') + '</span>';
    btn.onclick = () => { bankPillar = p.key; window.scrollTo(0, 0); render(); };
    grid.appendChild(btn);
  });
  el.appendChild(grid);
}

function renderPillarFolder(el, key) {
  const p = pillarOf(key);
  const ideas = bankIdeas(key);

  const head = document.createElement('div');
  head.className = 'folder-head surface c' + p.color;
  head.innerHTML =
    '<button type="button" class="folder-back" aria-label="All pillars">‹ All pillars</button>' +
    '<div class="folder-title-row"><span class="folder-icon">' + pillarIconSvg(p.key) + '</span>' +
    '<div><div class="card-title">' + escapeHtml(p.label) + '</div>' +
    '<div class="bank-sub">' + ideas.length + ' idea' + (ideas.length === 1 ? '' : 's') + ' · ' +
    clips.filter(c => !c.archived && c.status === 'posted' && c.pillar === key).length + ' posted</div></div></div>' +
    '<div class="folder-actions">' +
      '<button type="button" data-act="add">+ Add idea</button>' +
      '<button type="button" class="ghost" data-act="shuffle">' + SHUFFLE_ICON + '<span>Shuffle</span></button>' +
    '</div>';
  head.querySelector('.folder-back').onclick = () => { bankPillar = ''; render(); };
  head.querySelector('[data-act="add"]').onclick = () => openEntrySheet({ pillar: key });
  head.querySelector('[data-act="shuffle"]').onclick = () => surpriseIdea(key);
  el.appendChild(head);

  if (!ideas.length) {
    el.insertAdjacentHTML('beforeend', '<div class="empty-card">No ideas here yet. Add one, or open the AI prompt below for a batch.</div>');
  } else {
    const list = document.createElement('div');
    list.className = 'clip-rows';
    ideas.forEach(c => list.appendChild(buildClipRow(c)));
    el.appendChild(list);
  }

  // Care tips come with a starter list of carousel ideas
  if (key === 'care') el.appendChild(buildCarouselSuggestions());
}

function buildCarouselSuggestions() {
  const saved = new Set(clips.map(c => c.desc.trim().toLowerCase()));
  const wrap = document.createElement('details');
  wrap.className = 'suggest-box';
  const total = CAROUSEL_IDEAS.reduce((n, g) => n + g.ideas.length, 0);
  wrap.innerHTML = '<summary><span>Carousel ideas to try</span><span class="chip-count">' + total + '</span></summary>';
  CAROUSEL_IDEAS.forEach(group => {
    const title = document.createElement('div');
    title.className = 'suggest-group';
    title.textContent = group.pillar;
    wrap.appendChild(title);
    group.ideas.forEach(idea => {
      const row = document.createElement('div');
      row.className = 'suggest-row';
      const text = document.createElement('span');
      text.textContent = idea;
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'copy-btn';
      const isSaved = saved.has(idea.trim().toLowerCase());
      add.textContent = isSaved ? 'Saved' : '+ Save';
      add.disabled = isSaved;
      add.onclick = () => { saveIdeaToBank(idea, 'care'); add.textContent = 'Saved'; add.disabled = true; };
      row.appendChild(text);
      row.appendChild(add);
      wrap.appendChild(row);
    });
  });
  return wrap;
}

// Saves a line straight into the bank (from suggestions and templates)
function saveIdeaToBank(text, pillar) {
  const clip = normalizeClip({ id: uid(), desc: text, status: 'idea', pillar: pillar || inferPillar(text), created: new Date().toISOString() });
  clips.unshift(clip);
  saveClips();
  showToast('Saved to ' + pillarOf(clip.pillar).label, { onUndo: () => removeClipSilently(clip.id) });
  if (currentView === 'bank') {
    // Keep the open suggestions list open while the folder re-renders
    const open = !!document.querySelector('#bankContent .suggest-box[open]');
    render();
    const box = document.querySelector('#bankContent .suggest-box');
    if (open && box) box.open = true;
  } else render();
}

const SHUFFLE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>';
