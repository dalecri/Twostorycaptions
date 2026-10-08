// Outreach > Pitches: pitch emails and sponsored caption lines. Also the AI prompt panel in the Bank.

function fillTemplate(text, vars) {
  return text
    .replace(/\[BRAND\]/gi, vars.brand || '[BRAND]')
    .replace(/\[PRODUCT\]/gi, vars.product || '[PRODUCT]')
    .replace(/\[CATEGORY\]/gi, vars.category || '[CATEGORY]')
    .replace(/\[X\s*(MONTHS|WEEKS)\]/gi, vars.duration || '[X $1]')
    .replace(/\[NAME\]/gi, vars.name || '[NAME]')
    .replace(/\[CAT\]/gi, vars.cat || '[CAT]');
}

// Format C alternates upstairs/downstairs cat per [CAT] occurrence (order in the source text is upstairs, then downstairs)
function fillTwoFloorTemplate(text, vars) {
  let occurrence = 0;
  let filled = text.replace(/\[CAT\]/gi, () => {
    occurrence++;
    return occurrence === 1 ? (vars.upstairsCat || '[CAT]') : (vars.downstairsCat || '[CAT]');
  });
  return fillTemplate(filled, vars);
}

function setTemplateBrand(brandId) {
  const b = brands.find(x => x.id === brandId);
  tplContext.brand = b ? b.name : '';
  tplContext.product = b ? b.product : '';
  tplContext.category = b ? b.category : '';
  const sel = document.getElementById('tplBrandSelect');
  if (sel) sel.value = b ? b.id : '';
}

function setTemplateCat(cat) {
  const p = CAT_PROFILES[cat];
  tplContext.cat = p ? cat : '';
  // Two-floor captions need one cat from each floor: the picked cat plus a default from the other floor
  tplContext.upstairsCat = p ? (p.home === 'Upstairs' ? cat : 'Ramses') : '';
  tplContext.downstairsCat = p ? (p.home === 'Downstairs' ? cat : 'Cali') : '';
}

function refreshTemplateOutputs() {
  generatePitchOutput();
  generateCaptionOutput();
}

function goToFollowUpPitch(brandId) {
  const b = brands.find(x => x.id === brandId);
  if (b) setTemplateBrand(b.id);
  outreachTab = 'pitches';
  goTo('outreach');
  document.getElementById('tplPitchType').value = 'followUp';
  generatePitchOutput();
}

function getTplContext() {
  return tplContext;
}

function makeCopyableBlock(text, tagLabel, options) {
  const opts = options || {};
  const wrap = document.createElement('div');
  wrap.className = 'caption-opt';
  const topRow = document.createElement('div');
  topRow.className = 'caption-opt-top';
  const tag = document.createElement('span');
  tag.className = 'copy-tag';
  tag.textContent = tagLabel;
  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex; gap:6px;';
  if (opts.showSendBtn) {
    const sendBtn = document.createElement('button');
    sendBtn.className = 'copy-btn';
    sendBtn.textContent = '+ Save';
    sendBtn.title = 'Save to the caption bank';
    sendBtn.onclick = () => { saveIdeaToBank(text); sendBtn.textContent = 'Saved'; sendBtn.disabled = true; };
    btnGroup.appendChild(sendBtn);
  }
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = () => copyText(text, copyBtn);
  btnGroup.appendChild(copyBtn);
  topRow.appendChild(tag);
  topRow.appendChild(btnGroup);
  wrap.appendChild(topRow);
  const body = document.createElement('div');
  body.style.whiteSpace = 'pre-wrap';
  body.textContent = text;
  wrap.appendChild(body);
  return wrap;
}

function generatePitchOutput() {
  const ctx = getTplContext();
  const type = document.getElementById('tplPitchType').value;
  const tpl = PITCH_TEMPLATES[type];
  const out = document.getElementById('tplPitchOutput');
  out.innerHTML = '';
  if (tpl.subject) {
    const subjectFilled = fillTemplate(tpl.subject, ctx);
    out.appendChild(makeCopyableBlock(subjectFilled, 'Subject line'));
  }
  const bodyFilled = fillTemplate(tpl.body, ctx);
  out.appendChild(makeCopyableBlock(bodyFilled, tpl.label));
}

function generateCaptionOutput() {
  const ctx = getTplContext();
  const out = document.getElementById('tplCaptionOutput');
  out.innerHTML = '';
  CAPTION_TEMPLATES.forEach(group => {
    const title = document.createElement('div');
    title.className = 'tpl-format-title';
    title.textContent = group.format;
    out.appendChild(title);
    const isTwoFloor = group.format.indexOf('Two-floor') > -1;
    group.lines.forEach((line, i) => {
      const filled = isTwoFloor ? fillTwoFloorTemplate(line, ctx) : fillTemplate(line, ctx);
      out.appendChild(makeCopyableBlock(filled, 'Option ' + (i + 1), { showSendBtn: true }));
    });
  });
}

// ===== AI caption prompt: our voice guide, filled in with today's clip =====
let aiCats = [];
let aiVibe = '';
const AI_VIBES = PILLARS.map(p => p.label);

function buildAiPrompt() {
  const clip = document.getElementById('aiClipInput').value.trim();
  return AI_CAPTION_PROMPT
    .replace('{{CLIP}}', clip || '[describe what happens in the video]')
    .replace('{{CATS}}', aiCats.length ? aiCats.join(', ') : 'any of the four')
    .replace('{{VIBE}}', aiVibe ? aiVibe.toLowerCase() : 'any');
}

function renderAiPromptPanel() {
  fillCatPicker(document.getElementById('aiCatRow'), aiCats, (cat) => {
    aiCats = aiCats.includes(cat) ? aiCats.filter(c => c !== cat) : aiCats.concat(cat);
    renderAiPromptPanel();
  });
  const vibeRow = document.getElementById('aiVibeRow');
  vibeRow.innerHTML = '';
  AI_VIBES.forEach(v => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (aiVibe === v ? ' selected' : '');
    chip.setAttribute('aria-pressed', aiVibe === v ? 'true' : 'false');
    chip.textContent = v;
    chip.onclick = () => { aiVibe = aiVibe === v ? '' : v; renderAiPromptPanel(); };
    vibeRow.appendChild(chip);
  });
  const preview = document.getElementById('aiPromptPreview');
  if (!preview.hidden) preview.textContent = buildAiPrompt();
}

function initTemplatesSection() {
  renderAiPromptPanel();
  document.getElementById('aiClipInput').addEventListener('input', renderAiPromptPanel);
  document.getElementById('aiCopyBtn').addEventListener('click', (e) => copyText(buildAiPrompt(), e.currentTarget));
  document.getElementById('aiPreviewBtn').addEventListener('click', (e) => {
    const preview = document.getElementById('aiPromptPreview');
    preview.hidden = !preview.hidden;
    e.currentTarget.textContent = preview.hidden ? 'Show prompt' : 'Hide prompt';
    renderAiPromptPanel();
  });
  document.getElementById('tplGeneratePitchBtn').addEventListener('click', generatePitchOutput);
  const catSelect = document.getElementById('tplCatSelect');
  CATS.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat + ' (' + CAT_PROFILES[cat].breed + ')';
    catSelect.appendChild(opt);
  });
  catSelect.addEventListener('change', () => { setTemplateCat(catSelect.value); refreshTemplateOutputs(); });
  document.getElementById('tplBrandSelect').addEventListener('change', (e) => { setTemplateBrand(e.target.value); refreshTemplateOutputs(); });
  document.getElementById('tplPitchType').addEventListener('change', generatePitchOutput);
  document.getElementById('tplGenerateCaptionsBtn').addEventListener('click', generateCaptionOutput);
  document.getElementById('taskAddBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
  // Seed output panels once so sections aren't empty on first visit
  generatePitchOutput();
  generateCaptionOutput();
  renderTasks();
}
