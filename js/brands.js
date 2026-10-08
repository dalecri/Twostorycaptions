// Brands board: pipeline columns and tabs, pinned notes, brand form, quick-add.

function renderOutreach() {
  renderOutreachStats();
  renderQuickAddBrands();
  renderBrandBoard();
  refreshAllBrandDropdowns();
  renderTasks();
}

function fillBrandOptions(select, includeNoneLabel) {
  if (!select) return;
  const prevValue = select.value;
  select.innerHTML = `<option value="">${includeNoneLabel}</option>` +
    brands.filter(b => b.category !== 'Pinned').map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
  if (brands.some(b => b.id === prevValue)) select.value = prevValue;
}

function refreshAllBrandDropdowns() {
  fillBrandOptions(document.getElementById('tplBrandSelect'), 'Pick a brand…');
  fillBrandOptions(document.getElementById('newClipBrandSelect'), 'None');
  syncInlineSelect(document.getElementById('newClipBrandRow'));
  fillBrandOptions(document.getElementById('taskBrandSelect'), 'General');
}

function isPinnedBrand(b) { return b.category === 'Pinned'; }

function renderOutreachStats() {
  const pipeline = brands.filter(b => !isPinnedBrand(b));
  const total = pipeline.length;
  const applied = pipeline.filter(b => ['applied','waiting','partnered'].includes(b.status)).length;
  const waiting = pipeline.filter(b => b.status === 'waiting').length;
  const partnered = pipeline.filter(b => b.status === 'partnered').length;
  const el = document.getElementById('otStats');
  if (!el) return;
  el.innerHTML = `
    <span class="ot-stat-item"><strong>${total}</strong> brands</span>
    <span class="ot-stat-item"><strong>${applied}</strong> applied</span>
    <span class="ot-stat-item"><strong>${waiting}</strong> awaiting reply</span>
    <span class="ot-stat-item"><strong>${partnered}</strong> partnered</span>
  `;
}

function renderQuickAddBrands() {
  const el = document.getElementById('otQuickadd');
  if (!el) return;
  const existing = new Set(brands.map(b => b.name.toLowerCase()));
  const remaining = AMAZON_PURCHASE_HISTORY.filter(p => !existing.has(p.brand.toLowerCase()));
  el.innerHTML = remaining.length
    ? remaining.map(p => `<button type="button" class="ot-chip" data-name="${escapeHtml(p.brand)}" title="${escapeHtml(p.product)} — ${escapeHtml(p.orders)}">+ ${escapeHtml(p.brand)}</button>`).join('')
    : '<span style="font-family:\'Space Mono\',monospace; font-size:11.5px; color:var(--ink-soft);">All suggestions added</span>';
  el.querySelectorAll('.ot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = AMAZON_PURCHASE_HISTORY.find(x => x.brand === chip.dataset.name);
      brands.push({
        id: uidBrand(),
        name: chip.dataset.name,
        category: p ? p.category : '',
        status: 'researching',
        contact: '',
        product: p ? p.product : '',
        date: '',
        notes: p ? `From Amazon order history — ${p.orders}.` : ''
      });
      saveBrands();
      renderOutreach();
    });
  });
}

// On phones the five columns would stack into one very long scroll, so only the selected
// status shows, picked with tabs. Wider screens show every column side by side.
let brandTab = 'researching';

let brandTabPicked = false;

function renderBrandBoard() {
  const board = document.getElementById('otBoard');
  if (!board) return;
  const section = document.getElementById('otPipelineSection');
  const pipeline = brands.filter(b => !isPinnedBrand(b));
  // Don't open on an empty tab when another one has brands in it
  if (!brandTabPicked && !pipeline.some(b => b.status === brandTab)) {
    const first = BRAND_STATUSES.find(c => pipeline.some(b => b.status === c.key));
    if (first) brandTab = first.key;
  }

  // Pinned notes (strategy reminders) sit above the board instead of inside a column
  document.getElementById('otPinned').innerHTML = brands.filter(isPinnedBrand).map(b => `
    <div class="ot-pinned surface c6">
      <div class="card-kicker">Pinned note</div>
      <div class="ot-card-name">${escapeHtml(b.name.replace(/^★\s*/, ''))}</div>
      ${b.notes ? `<div class="ot-card-notes">${escapeHtml(b.notes)}</div>` : ''}
      <div class="ot-card-actions">
        <button type="button" class="ot-mini-btn" data-brand-edit="${escapeHtml(b.id)}">Edit</button>
        <button type="button" class="ot-mini-btn" data-brand-del="${escapeHtml(b.id)}">Delete</button>
      </div>
    </div>`).join('');

  document.getElementById('otTabs').innerHTML = BRAND_STATUSES.map(col => {
    const n = pipeline.filter(b => b.status === col.key).length;
    const on = col.key === brandTab;
    return `<button type="button" role="tab" aria-selected="${on}" class="ot-tab${on ? ' active' : ''}" data-brand-tab="${col.key}">${col.label}<span class="ot-tab-count">${n}</span></button>`;
  }).join('');

  // Each pipeline column is a colored card
  const COL_COLORS = { researching: 'c2', applied: 'c1', waiting: 'c6', partnered: 'c0', passed: 'c5' };
  board.innerHTML = BRAND_STATUSES.map(col => {
    const items = pipeline.filter(b => b.status === col.key);
    return `
      <div class="ot-col ${col.key} surface ${COL_COLORS[col.key] || 'c3'}${col.key === brandTab ? ' tab-active' : ''}">
        <div class="ot-col-head">
          <div class="ot-col-title">${col.label}</div>
          <div class="ot-col-count">${items.length}</div>
        </div>
        ${items.length ? items.map(brandCardHtml).join('') : '<div class="ot-empty">Nothing here yet</div>'}
      </div>
    `;
  }).join('');

  section.querySelectorAll('[data-brand-tab]').forEach(b => b.addEventListener('click', () => { brandTab = b.dataset.brandTab; brandTabPicked = true; renderBrandBoard(); }));
  section.querySelectorAll('[data-brand-edit]').forEach(b => b.addEventListener('click', () => openBrandEdit(b.dataset.brandEdit)));
  section.querySelectorAll('[data-brand-del]').forEach(b => b.addEventListener('click', () => deleteBrand(b.dataset.brandDel)));
  section.querySelectorAll('[data-brand-followup]').forEach(b => b.addEventListener('click', () => goToFollowUpPitch(b.dataset.brandFollowup)));
  section.querySelectorAll('[data-brand-move]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const b = brands.find(x => x.id === sel.dataset.brandMove);
      if (!b) return;
      const label = (BRAND_STATUSES.find(c => c.key === e.target.value) || {}).label || e.target.value;
      b.status = e.target.value;
      b.updatedAt = new Date().toISOString();
      saveBrands();
      renderOutreach();
      // On phones the card just left the visible column, so say where it went
      if (isMobile()) showToast(b.name + ' moved to ' + label);
    });
  });
}

function brandCardHtml(b) {
  const statusOptions = BRAND_STATUSES.map(c => `<option value="${c.key}" ${c.key === b.status ? 'selected' : ''}>${c.label}</option>`).join('');
  const linkedCount = clips.filter(c => c.brandId === b.id).length;
  const idle = b.status === 'waiting' ? daysSince(b.date || b.updatedAt) : null;
  const isStale = idle !== null && idle >= 14;
  const brandTasks = tasks.filter(t => t.brandId === b.id);
  const tasksDone = brandTasks.filter(t => t.done).length;
  return `
    <div class="ot-card">
      <div class="ot-card-name">${escapeHtml(b.name)}</div>
      ${b.category ? `<div class="ot-card-cat">${escapeHtml(b.category)}</div>` : ''}
      ${b.product ? `<div class="ot-card-notes">Uses: ${escapeHtml(b.product)}</div>` : ''}
      ${b.notes ? `<div class="ot-card-notes">${escapeHtml(b.notes)}</div>` : ''}
      ${b.date ? `<div class="ot-card-date">${escapeHtml(b.date)}</div>` : ''}
      ${linkedCount ? `<div class="ot-card-date">🔗 ${linkedCount} caption${linkedCount === 1 ? '' : 's'} linked</div>` : ''}
      ${brandTasks.length ? `<div class="ot-card-date">✓ ${tasksDone}/${brandTasks.length} tasks done</div>` : ''}
      ${isStale ? `<div class="ot-stale-badge">⏰ ${idle} days since last contact — <button type="button" class="ot-mini-btn" data-brand-followup="${escapeHtml(b.id)}">Draft follow-up</button></div>` : ''}
      <div class="ot-card-actions">
        <select class="ot-mini-select" data-brand-move="${escapeHtml(b.id)}">${statusOptions}</select>
        <button type="button" class="ot-mini-btn" data-brand-edit="${escapeHtml(b.id)}">Edit</button>
        <button type="button" class="ot-mini-btn" data-brand-del="${escapeHtml(b.id)}">Delete</button>
      </div>
    </div>
  `;
}

function deleteBrand(id) {
  const b = brands.find(x => x.id === id);
  removeWithUndo(brands, [id], (b ? b.name : 'Brand') + ' deleted', saveBrands, () => { refreshAllBrandDropdowns(); renderOutreach(); });
}

function openBrandEdit(id) {
  const b = brands.find(x => x.id === id);
  if (!b) return;
  editingBrandId = id;
  document.getElementById('otPanelTitle').textContent = 'Edit brand';
  document.getElementById('ot-f-name').value = b.name;
  document.getElementById('ot-f-category').value = b.category;
  document.getElementById('ot-f-status').value = b.status;
  document.getElementById('ot-f-contact').value = b.contact;
  document.getElementById('ot-f-product').value = b.product;
  document.getElementById('ot-f-date').value = b.date;
  document.getElementById('ot-f-notes').value = b.notes;
  document.getElementById('otPanel').classList.add('open');
  document.getElementById('otPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetBrandForm() {
  editingBrandId = '';
  document.getElementById('otPanelTitle').textContent = 'Add a brand';
  ['ot-f-name','ot-f-category','ot-f-contact','ot-f-product','ot-f-date','ot-f-notes'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('ot-f-status').value = 'researching';
}

// ===== Outreach: one page with three tabs =====
const OUTREACH_TABS = [['brands', 'Brands'], ['pitches', 'Pitches'], ['checklist', 'Checklist']];

function renderOutreachTabs() {
  const bar = document.getElementById('otSubTabs');
  bar.innerHTML = '';
  OUTREACH_TABS.forEach(([key, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', outreachTab === key ? 'true' : 'false');
    b.className = 'seg-tab' + (outreachTab === key ? ' active' : '');
    b.textContent = label;
    b.onclick = () => { outreachTab = key; render(); };
    bar.appendChild(b);
  });
  document.getElementById('otPipelineSection').style.display = outreachTab === 'brands' ? '' : 'none';
  document.getElementById('otTemplatesSection').style.display = outreachTab === 'pitches' ? '' : 'none';
  document.getElementById('otTasksSection').style.display = outreachTab === 'checklist' ? '' : 'none';
}

function saveBrandForm() {
  const name = document.getElementById('ot-f-name').value.trim();
  if (!name) { alert('Give the brand a name first'); return; }
  const data = {
    name,
    category: document.getElementById('ot-f-category').value.trim(),
    status: document.getElementById('ot-f-status').value,
    contact: document.getElementById('ot-f-contact').value.trim(),
    product: document.getElementById('ot-f-product').value.trim(),
    date: document.getElementById('ot-f-date').value,
    notes: document.getElementById('ot-f-notes').value.trim()
  };
  if (editingBrandId) {
    const b = brands.find(x => x.id === editingBrandId);
    if (b) Object.assign(b, data, { updatedAt: new Date().toISOString() });
  } else {
    brands.push({ id: uidBrand(), ...data, updatedAt: new Date().toISOString() });
  }
  saveBrands();
  document.getElementById('otPanel').classList.remove('open');
  resetBrandForm();
  renderOutreach();
}

document.getElementById('otOpenForm').addEventListener('click', () => {
  resetBrandForm();
  document.getElementById('otPanel').classList.add('open');
});

document.getElementById('otToggleQuick').addEventListener('click', () => {
  document.getElementById('otQuickadd').classList.toggle('open');
});

document.getElementById('otCancelBtn').addEventListener('click', () => {
  document.getElementById('otPanel').classList.remove('open');
  resetBrandForm();
});

document.getElementById('otSaveBtn').addEventListener('click', saveBrandForm);
