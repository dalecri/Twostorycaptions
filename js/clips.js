// The add sheet and actions on cards: create, tag, schedule, archive, delete, draft captions.

function renderNewClipDateRow() {
  const row = document.getElementById('newClipDateRow');
  row.innerHTML = '';
  row.appendChild(buildDateChip(newClipDate, (v) => { newClipDate = v; renderNewClipDateRow(); }));
}

function toggleNewClipTone(tone) {
  const idx = newClipTones.indexOf(tone);
  if (idx > -1) newClipTones.splice(idx, 1);
  else newClipTones.push(tone);
  renderNewClipTones();
}

function renderNewClipTones() {
  const row = document.getElementById('newClipToneRow');
  row.innerHTML = '';
  TONES.forEach(tone => row.appendChild(buildToneChip(tone, newClipTones.includes(tone), () => toggleNewClipTone(tone))));
}

function toggleTone(clipId, tone) {
  const clip = clips.find(c => c.id === clipId);
  if (!clip) return;
  if (!clip.selectedTones) clip.selectedTones = ['Deadpan nature-doc'];
  const idx = clip.selectedTones.indexOf(tone);
  if (idx > -1) clip.selectedTones.splice(idx, 1);
  else clip.selectedTones.push(tone);
  saveClips(clipId);
  render();
}

function addClip() {
  const desc = document.getElementById('descInput').value.trim();
  if (!desc) return;
  const dateVal = newClipDate;
  const brandVal = document.getElementById('newClipBrandSelect').value;
  const newId = uid();
  clips.unshift({
    id: newId,
    desc,
    status: dateVal ? 'scheduled' : 'idea',
    created: new Date().toISOString(),
    captions: null,
    selectedTones: newClipTones.length ? [...newClipTones] : ['Deadpan nature-doc'],
    platform: 'Both',
    scheduledDate: dateVal || '',
    videoLink: '',
    brandId: brandVal || '',
    catTags: newClipCats.length ? [...newClipCats] : [],
    archived: false
  });
  document.getElementById('descInput').value = '';
  document.getElementById('newClipBrandSelect').value = '';
  syncInlineSelect(document.getElementById('newClipBrandRow'));
  newClipDate = '';
  renderNewClipDateRow();
  newClipCats = [];
  renderNewClipCats();
  saveClips(newId);
  render();
  closeEntrySheet();
}

function toggleNewClipCat(cat) {
  const idx = newClipCats.indexOf(cat);
  if (idx > -1) newClipCats.splice(idx, 1);
  else newClipCats.push(cat);
  renderNewClipCats();
}

function renderNewClipCats() {
  const row = document.getElementById('newClipCatRow');
  if (!row) return;
  fillCatPicker(row, newClipCats, toggleNewClipCat);
}

function toggleClipCat(clipId, cat) {
  const c = clips.find(c => c.id === clipId);
  if (!c) return;
  if (!c.catTags) c.catTags = [];
  const idx = c.catTags.indexOf(cat);
  if (idx > -1) c.catTags.splice(idx, 1);
  else c.catTags.push(cat);
  saveClips(clipId);
  refreshOpenModal();
  render();
}

function toggleClipArchived(clipId) {
  const c = clips.find(c => c.id === clipId);
  if (!c) return;
  c.archived = !c.archived;
  saveClips(clipId);
  closeCardModal(true);
  render();
  showToast(c.archived ? 'Card archived' : 'Card restored', {
    onUndo: () => { c.archived = !c.archived; saveClips(clipId); render(); }
  });
}

function openEntrySheet() {
  document.getElementById('entryForm').classList.add('sheet-open');
  document.getElementById('sheetBackdrop').classList.add('open');
  document.getElementById('descInput').focus();
}

function closeEntrySheet() {
  document.getElementById('entryForm').classList.remove('sheet-open');
  document.getElementById('sheetBackdrop').classList.remove('open');
}

function updateStatus(id, status) {
  const c = clips.find(c => c.id === id);
  if (!c) return;
  c.status = status;
  if (status === 'posted' && !c.scheduledDate) {
    const now = new Date();
    c.scheduledDate = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  }
  saveClips(id);
  render();
}

function setScheduledDate(id, dateStr) {
  const c = clips.find(c => c.id === id);
  if (!c) return;
  c.scheduledDate = dateStr;
  if (dateStr && c.status !== 'posted' && c.status !== 'scheduled') c.status = 'scheduled';
  saveClips(id);
  render();
}

function removeClip(id) {
  removeWithUndo(clips, [id], 'Card deleted', saveClips, render);
}

function generateCaptions(id) {
  const clip = clips.find(c => c.id === id);
  if (!clip) return;
  const tones = (clip.selectedTones && clip.selectedTones.length) ? clip.selectedTones : ['Deadpan nature-doc'];
  const cat = (clip.catTags && clip.catTags[0]) || 'this one';
  const previous = (clip.captions && clip.captions.captions) || [];

  // One option per tone when several are picked, otherwise three in the one tone
  const toneSlots = tones.length > 1 ? tones.slice(0, 3) : [tones[0], tones[0], tones[0]];
  const picked = [];
  toneSlots.forEach(tone => {
    const lines = OFFLINE_CAPTIONS[tone] || OFFLINE_CAPTIONS['Deadpan nature-doc'];
    picked.push(pickRandom(lines, picked.concat(previous)));
  });

  clip.captions = {
    captions: picked.map(line => line.replace(/\[CAT\]/g, cat)),
    hashtagsInstagram: hashtagsFor('Instagram'),
    hashtagsTiktok: hashtagsFor('TikTok')
  };
  clip.captionTones = tones.length > 1 ? toneSlots : [];
  if (clip.status === 'filmed' || clip.status === 'idea') clip.status = 'captioned';
  saveClips();
  render();
}

document.getElementById('addBtn').addEventListener('click', addClip);

document.getElementById('newClipBrandSelect').addEventListener('change', () => syncInlineSelect(document.getElementById('newClipBrandRow')));

function handleFabAddClick() {
  // + is always "new caption" now, regardless of which page you're on (including Brands).
  openEntrySheet();
}

document.getElementById('sheetCloseBtn').addEventListener('click', closeEntrySheet);

document.getElementById('sheetBackdrop').addEventListener('click', closeEntrySheet);

document.getElementById('descInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.metaKey) addClip();
});
