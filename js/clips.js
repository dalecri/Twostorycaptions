// The add sheet and actions on cards: create, edit, tag, stage, schedule, archive, delete.

// ===== Add sheet: text, pillar, cats. Date, brand and stage hide under "More" =====

function renderNewClipDateRow() {
  const row = document.getElementById('newClipDateRow');
  row.innerHTML = '';
  row.appendChild(buildDateChip(newClipDate, (v) => { newClipDate = v; renderNewClipDateRow(); renderNewClipStage(); }));
}

function renderNewClipPillars() {
  fillPillarPicker(document.getElementById('newClipPillarRow'), newClipPillar, (key) => { newClipPillar = key; renderNewClipPillars(); });
  const hint = document.getElementById('newClipPillarHint');
  const desc = document.getElementById('descInput').value.trim();
  hint.textContent = newClipPillar ? '' : desc ? 'Not picked: goes in ' + pillarOf(inferPillar(desc)).label : 'Skip it and we\'ll sort it by the words';
}

function newClipStage() {
  return newClipStatus || (newClipDate ? 'planned' : 'idea');
}

function renderNewClipStage() {
  const row = document.getElementById('newClipStageRow');
  row.innerHTML = '';
  row.appendChild(buildStageToggle(newClipStage(), (s) => { newClipStatus = s; renderNewClipStage(); }));
  const btn = document.getElementById('addBtn');
  btn.textContent = { idea: 'Save to bank', planned: 'Add to plan', posted: 'Add to library' }[newClipStage()];
}

function renderNewClipCats() {
  const row = document.getElementById('newClipCatRow');
  if (!row) return;
  fillCatPicker(row, newClipCats, toggleNewClipCat);
}

function toggleNewClipCat(cat) {
  const idx = newClipCats.indexOf(cat);
  if (idx > -1) newClipCats.splice(idx, 1);
  else newClipCats.push(cat);
  renderNewClipCats();
}

function setSheetMore(open) {
  document.getElementById('sheetMore').hidden = !open;
  const btn = document.getElementById('sheetMoreBtn');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  btn.querySelector('span').textContent = open ? 'Less' : 'Date, brand, stage';
}

function resetEntrySheet() {
  document.getElementById('descInput').value = '';
  document.getElementById('newClipBrandSelect').value = '';
  syncInlineSelect(document.getElementById('newClipBrandRow'));
  newClipDate = '';
  newClipCats = [];
  newClipPillar = '';
  newClipStatus = '';
  setSheetMore(false);
  renderEntrySheet();
}

function renderEntrySheet() {
  renderNewClipPillars();
  renderNewClipCats();
  renderNewClipDateRow();
  renderNewClipStage();
}

function addClip() {
  const desc = document.getElementById('descInput').value.trim();
  if (!desc) { document.getElementById('descInput').focus(); return; }
  const status = newClipStage();
  let date = newClipDate;
  if (status === 'posted' && !date) date = localToday();
  const clip = normalizeClip({
    id: uid(),
    desc,
    status,
    pillar: newClipPillar || inferPillar(desc),
    created: new Date().toISOString(),
    scheduledDate: status === 'idea' ? '' : date,
    brandId: document.getElementById('newClipBrandSelect').value || '',
    catTags: [...newClipCats]
  });
  clips.unshift(clip);
  saveClips();
  resetEntrySheet();
  closeEntrySheet();
  render();
  const where = { idea: 'Saved to ' + pillarOf(clip.pillar).label, planned: date ? 'Planned for ' + formatDateLong(date) : 'Added to the plan', posted: 'Added to the library' }[status];
  showToast(where, { onUndo: () => removeClipSilently(clip.id) });
}

// Opens the sheet; preset fills the pillar, cats or date when it's opened from a pillar, a cat or a day.
function openEntrySheet(preset) {
  const p = preset || {};
  if (p.pillar) newClipPillar = p.pillar;
  if (p.cats) newClipCats = [...p.cats];
  if (p.date) { newClipDate = p.date; setSheetMore(true); }
  renderEntrySheet();
  document.getElementById('entryForm').classList.add('sheet-open');
  document.getElementById('sheetBackdrop').classList.add('open');
  document.getElementById('descInput').focus();
}

function closeEntrySheet() {
  document.getElementById('entryForm').classList.remove('sheet-open');
  document.getElementById('sheetBackdrop').classList.remove('open');
}

// + always means "new caption". In a pillar folder it starts in that pillar.
function handleFabAddClick() {
  openEntrySheet(currentView === 'bank' && bankPillar ? { pillar: bankPillar } : null);
}

// ===== Card actions =====

function findClip(id) { return clips.find(c => c.id === id); }

function editClipText(id, text) {
  const c = findClip(id);
  const t = text.trim();
  if (!c || !t || t === c.desc) return;
  c.desc = t.slice(0, 2000);
  saveClips();
  render();
}

function setClipPillar(id, key) {
  const c = findClip(id);
  if (!c || !key) return;
  c.pillar = key;
  saveClips();
  render();
  refreshOpenModal();
}

function toggleClipCat(clipId, cat) {
  const c = findClip(clipId);
  if (!c) return;
  const idx = c.catTags.indexOf(cat);
  if (idx > -1) c.catTags.splice(idx, 1);
  else c.catTags.push(cat);
  saveClips();
  refreshOpenModal();
  render();
}

function toggleClipArchived(clipId) {
  const c = findClip(clipId);
  if (!c) return;
  c.archived = !c.archived;
  saveClips();
  closeCardModal(true);
  render();
  showToast(c.archived ? 'Card archived' : 'Card restored', {
    onUndo: () => { c.archived = !c.archived; saveClips(); render(); }
  });
}

// Moving a card between stages. Posting stamps today if there's no date; back to the bank
// drops the date, since the bank is for undated ideas.
function updateStatus(id, status) {
  const c = findClip(id);
  if (!c || !STATUSES.includes(status)) return;
  const prev = { status: c.status, date: c.scheduledDate };
  c.status = status;
  if (status === 'posted' && !c.scheduledDate) c.scheduledDate = localToday();
  if (status === 'idea') c.scheduledDate = '';
  saveClips();
  render();
  refreshOpenModal();
  const msg = { idea: 'Back in the bank', planned: 'On the plan', posted: 'Moved to the library' }[status];
  showToast(msg, { onUndo: () => { c.status = prev.status; c.scheduledDate = prev.date; saveClips(); render(); refreshOpenModal(); } });
}

function setScheduledDate(id, dateStr) {
  const c = findClip(id);
  if (!c) return;
  c.scheduledDate = dateStr;
  if (dateStr && c.status === 'idea') c.status = 'planned';
  saveClips();
  render();
}

function removeClip(id) {
  removeWithUndo(clips, [id], 'Card deleted', saveClips, render);
}

function removeClipSilently(id) {
  const i = clips.findIndex(c => c.id === id);
  if (i > -1) clips.splice(i, 1);
  saveClips();
  render();
}

// The AI prompt filled in from a card: its text, cats and pillar
function aiPromptForClip(clip) {
  return AI_CAPTION_PROMPT
    .replace('{{CLIP}}', clip.desc || '[describe what happens in the video]')
    .replace('{{CATS}}', clip.catTags.length ? clip.catTags.join(', ') : 'any of the four')
    .replace('{{VIBE}}', pillarOf(clip.pillar).label.toLowerCase());
}

document.getElementById('addBtn').addEventListener('click', addClip);

document.getElementById('newClipBrandSelect').addEventListener('change', () => syncInlineSelect(document.getElementById('newClipBrandRow')));

document.getElementById('sheetMoreBtn').addEventListener('click', () => setSheetMore(document.getElementById('sheetMore').hidden));

document.getElementById('sheetCloseBtn').addEventListener('click', closeEntrySheet);

document.getElementById('sheetBackdrop').addEventListener('click', closeEntrySheet);

document.getElementById('descInput').addEventListener('input', renderNewClipPillars);

document.getElementById('descInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addClip();
});
