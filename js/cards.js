// Card rendering (full cards, compact rows, the open card) and the pick-out / put-back animation.

let catSvgSeq = 0;

function catAvatarSvg(name) {
  const p = CAT_PROFILES[name];
  if (!p) return '';
  const clipId = 'catclip' + (++catSvgSeq);
  const ink = '#2A2320';
  const earL = p.bigEars ? '11,31 13,1 31,19' : '13,31 17,8 30,20';
  const earR = p.bigEars ? '53,31 51,1 33,19' : '51,31 47,8 34,20';
  const innerL = p.bigEars ? '15,27 16,8 27,20' : '16,27 18,13 27,21';
  const innerR = p.bigEars ? '49,27 48,8 37,20' : '48,27 46,13 37,21';
  let earFillL = p.fur, earFillR = p.fur, pattern = '';
  if (p.pattern === 'calico') {
    earFillL = '#E8913A'; earFillR = '#2B2B2B';
    pattern = '<circle cx="19" cy="27" r="10" fill="#E8913A"/><circle cx="46" cy="25" r="9" fill="#2B2B2B"/><circle cx="47" cy="47" r="5" fill="#E8913A"/>';
  } else if (p.pattern === 'tuxedo') {
    pattern = '<ellipse cx="32" cy="47" rx="11" ry="9" fill="#FFFFFF"/><path d="M32 22 L28 34 L36 34 Z" fill="#FFFFFF" opacity="0.9"/>';
  } else if (p.pattern === 'spots') {
    pattern = [[20,26,2.2],[26,22,1.8],[38,22,1.8],[44,26,2.2],[17,36,2],[47,36,2],[23,31,1.4],[41,31,1.4]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A3B1A"/>`).join('');
  } else if (p.pattern === 'rosettes') {
    pattern = [[19,27],[45,27],[16,38],[48,38],[27,22],[37,22]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#9A5A22" stroke="#4A2A10" stroke-width="1.2"/>`).join('');
  }
  const whisker = p.pattern === 'tuxedo' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.35)';
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="${p.bg}"/>
    <polygon points="${earL}" fill="${earFillL}"/><polygon points="${earR}" fill="${earFillR}"/>
    <polygon points="${innerL}" fill="${p.inner}"/><polygon points="${innerR}" fill="${p.inner}"/>
    <clipPath id="${clipId}"><ellipse cx="32" cy="37" rx="21" ry="18"/></clipPath>
    <ellipse cx="32" cy="37" rx="21" ry="18" fill="${p.fur}"/>
    <g clip-path="url(#${clipId})">${pattern}</g>
    <ellipse cx="24" cy="36" rx="3.6" ry="4.3" fill="${p.eye}"/><ellipse cx="40" cy="36" rx="3.6" ry="4.3" fill="${p.eye}"/>
    <ellipse cx="24" cy="36.4" rx="1.3" ry="3.1" fill="#111"/><ellipse cx="40" cy="36.4" rx="1.3" ry="3.1" fill="#111"/>
    <circle cx="25.2" cy="34.3" r="1" fill="#FFF"/><circle cx="41.2" cy="34.3" r="1" fill="#FFF"/>
    <circle cx="18" cy="43" r="3" fill="#FF8FA3" opacity="0.5"/><circle cx="46" cy="43" r="3" fill="#FF8FA3" opacity="0.5"/>
    <path d="M29.6 41.6 h4.8 l-2.4 2.6 z" fill="#F08A9C"/>
    <path d="M32 44.2 q-1.8 2.6 -4.2 1.4 M32 44.2 q1.8 2.6 4.2 1.4" stroke="${p.pattern === 'tuxedo' ? '#444' : ink}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M14 41 l8 1 M14 45 l8 -0.5 M50 41 l-8 1 M50 45 l-8 -0.5" stroke="${whisker}" stroke-width="0.9" stroke-linecap="round"/>
  </svg>`;
}

// Overlapping avatars for the cats in a clip (top-left of every card)
function catStackHtml(cats) {
  const list = (cats || []).filter(c => CAT_PROFILES[c]);
  if (!list.length) {
    return '<div class="cat-stack"><span class="cat-avatar cat-avatar-empty" title="No cats tagged">' + NAV_ICONS.paw + '</span></div>';
  }
  return '<div class="cat-stack" title="' + escapeHtml(list.join(', ')) + '">' +
    list.map(c => '<span class="cat-avatar">' + catAvatarSvg(c) + '</span>').join('') + '</div>';
}

// A small round pillar badge: icon + name
function pillarChipHtml(key) {
  const p = pillarOf(key);
  return '<span class="pillar-tag">' + pillarIconSvg(p.key) + '<span>' + escapeHtml(p.label) + '</span></span>';
}

function fieldLabel(text) {
  const el = document.createElement('div');
  el.className = 'field-label';
  el.textContent = text;
  return el;
}

// Editor shown inside a picked-out card. The card's own header (cats, date, pillar) sits above it.
function buildFullCard(clip) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-highlight-id', clip.id);

  // The caption itself: edit in place, saved when you leave the box
  const descWrap = document.createElement('div');
  descWrap.className = 'card-desc-wrap';
  const desc = document.createElement('textarea');
  desc.className = 'card-desc card-desc-edit';
  desc.rows = 2;
  desc.value = clip.desc;
  desc.setAttribute('aria-label', 'Caption');
  const grow = () => { desc.style.height = 'auto'; desc.style.height = desc.scrollHeight + 'px'; };
  desc.addEventListener('input', grow);
  desc.addEventListener('change', () => editClipText(clip.id, desc.value));
  requestAnimationFrame(grow);
  descWrap.appendChild(desc);
  const descCopyBtn = document.createElement('button');
  descCopyBtn.className = 'desc-copy-btn';
  descCopyBtn.title = 'Copy caption + hashtags';
  descCopyBtn.innerHTML = NAV_ICONS.copy;
  descCopyBtn.onclick = (e) => {
    e.stopPropagation();
    const tags = hashtagsFor('Instagram');
    copyWithIconFeedback(desc.value.trim() + (tags ? '\n\n' + tags : ''), descCopyBtn);
  };
  descWrap.appendChild(descCopyBtn);
  card.appendChild(descWrap);

  card.appendChild(fieldLabel('Stage'));
  card.appendChild(buildStageToggle(clip.status, (s) => updateStatus(clip.id, s)));

  card.appendChild(fieldLabel('Pillar'));
  const pillarRow = document.createElement('div');
  fillPillarPicker(pillarRow, clip.pillar, (key) => setClipPillar(clip.id, key || clip.pillar));
  card.appendChild(pillarRow);

  card.appendChild(fieldLabel('Starring'));
  const catRow = document.createElement('div');
  fillCatPicker(catRow, clip.catTags, cat => toggleClipCat(clip.id, cat));
  card.appendChild(catRow);

  card.appendChild(fieldLabel(clip.status === 'posted' ? 'Posted on' : 'Post date'));
  card.appendChild(buildDateChip(clip.scheduledDate, (v) => { setScheduledDate(clip.id, v); refreshOpenModal(); }));

  // Lines saved with older versions of the app
  const caps = (clip.captions && clip.captions.captions) || [];
  if (caps.length) {
    card.appendChild(fieldLabel('Saved lines'));
    const box = document.createElement('div');
    box.className = 'captions-box';
    caps.forEach((cap) => {
      const opt = document.createElement('div');
      opt.className = 'caption-opt';
      const text = document.createElement('div');
      text.className = 'caption-opt-text';
      text.textContent = cap;
      const copy = document.createElement('button');
      copy.className = 'platform-copy-btn';
      copy.title = 'Copy with hashtags';
      copy.innerHTML = NAV_ICONS.copy;
      copy.onclick = () => { const t = hashtagsFor('Instagram'); copyWithIconFeedback(t ? cap + '\n\n' + t : cap, copy); };
      opt.appendChild(text);
      opt.appendChild(copy);
      box.appendChild(opt);
    });
    card.appendChild(box);
  }

  // Not happy with the line? Hand it to an AI chat in our voice
  const ai = document.createElement('div');
  ai.className = 'card-ai';
  const aiBtn = document.createElement('button');
  aiBtn.type = 'button';
  aiBtn.className = 'ghost card-ai-btn';
  aiBtn.textContent = 'Copy AI prompt for this';
  aiBtn.onclick = () => copyText(aiPromptForClip(clip), aiBtn);
  ai.appendChild(aiBtn);
  const aiHint = document.createElement('span');
  aiHint.className = 'card-ai-hint';
  aiHint.textContent = 'Paste in any AI chat for 10 more lines in our voice';
  ai.appendChild(aiHint);
  card.appendChild(ai);

  const brandRow = buildBrandInlineSelect(clip.brandId, (id) => { clip.brandId = id; saveClips(); render(); });
  brandRow.classList.add('card-brand-row');
  card.appendChild(brandRow);

  const bottomRow = document.createElement('div');
  bottomRow.className = 'card-footer-actions';
  const archiveBtn = document.createElement('button');
  archiveBtn.className = 'ghost card-footer-btn';
  archiveBtn.innerHTML = NAV_ICONS.archive + '<span>' + (clip.archived ? 'Unarchive' : 'Archive') + '</span>';
  archiveBtn.onclick = () => toggleClipArchived(clip.id);
  bottomRow.appendChild(archiveBtn);
  const trashBtn = document.createElement('button');
  trashBtn.className = 'ghost card-footer-btn danger';
  trashBtn.innerHTML = NAV_ICONS.trash + '<span>Delete</span>';
  trashBtn.onclick = () => { removeClip(clip.id); closeCardModal(true); };
  bottomRow.appendChild(trashBtn);
  card.appendChild(bottomRow);

  return card;
}

// Each clip's card colour comes from its pillar, so it looks the same everywhere.
function clipColorIndex(clip) {
  return pillarOf(clip.pillar).color;
}

// Full-size coloured card (Home's up next, the plan). Tapping it picks it out.
function buildStackCard(clip) {
  const colorIdx = clipColorIndex(clip);
  const card = document.createElement('div');
  card.className = 'stack-card flat c' + colorIdx;
  card.dataset.color = colorIdx;
  card.setAttribute('data-highlight-id', clip.id);
  if (document.getElementById('cardModalOverlay').dataset.clipId === clip.id) card.classList.add('picked');

  const brand = clip.brandId ? brands.find(b => b.id === clip.brandId) : null;
  card.appendChild(buildStackHead(clip));

  const body = document.createElement('div');
  body.className = 'stack-body';
  const bodyText = document.createElement('div');
  bodyText.className = 'stack-body-text';
  bodyText.textContent = clip.desc || 'Untitled';
  body.appendChild(bodyText);
  card.appendChild(body);

  const foot = document.createElement('div');
  foot.className = 'stack-foot';
  const tagWrap = document.createElement('div');
  tagWrap.className = 'stack-foot-tags';
  const tags = [];
  if (isOverdue(clip)) tags.push('⚠ Overdue');
  if (brand) tags.push('🏷 ' + brand.name);
  if (clip.archived) tags.push('Archived');
  tags.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'stack-tag' + (t.startsWith('⚠') ? ' warn' : '');
    chip.textContent = t;
    tagWrap.appendChild(chip);
  });
  foot.appendChild(tagWrap);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'stack-copy-btn';
  copyBtn.title = 'Copy caption + hashtags';
  copyBtn.innerHTML = NAV_ICONS.copy;
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    const tagsText = hashtagsFor('Instagram');
    copyWithIconFeedback(clip.desc + (tagsText ? '\n\n' + tagsText : ''), copyBtn);
  };
  foot.appendChild(copyBtn);
  card.appendChild(foot);

  card.onclick = () => openCardModal(clip.id, card);
  makePressable(card, clip.desc || 'Untitled card');
  return card;
}

// Cats + date on top, pillar underneath. Shared by full cards and the open card.
function buildStackHead(clip) {
  let sideLabel, sideValue;
  if (clip.scheduledDate) {
    const [y, m, d] = clip.scheduledDate.split('-').map(Number);
    sideLabel = clip.status === 'posted' ? 'Posted' : 'Posts';
    sideValue = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (clip.status === 'posted') {
    // e.g. imported history: no date, so say where it went up rather than when it was logged
    sideLabel = 'Posted on';
    sideValue = clip.platform === 'Both' ? 'IG + TikTok' : clip.platform;
  } else {
    sideLabel = STATUS_LABELS[clip.status];
    sideValue = 'No date';
  }

  const wrap = document.createElement('div');
  wrap.className = 'stack-headwrap';
  const head = document.createElement('div');
  head.className = 'stack-head';
  head.innerHTML = catStackHtml(clip.catTags) +
    '<div class="stack-side">' +
      '<div class="stack-side-label">' + escapeHtml(sideLabel) + '</div>' +
      '<div class="stack-side-value">' + escapeHtml(sideValue) + '</div>' +
    '</div>';
  wrap.appendChild(head);
  wrap.insertAdjacentHTML('beforeend', pillarChipHtml(clip.pillar));
  return wrap;
}

// Compact row: bank folders and search results. Shows the line, cats and date at a glance.
function buildClipRow(clip, opts) {
  const o = opts || {};
  const row = document.createElement('div');
  row.className = 'clip-row c' + clipColorIndex(clip) + (clip.status === 'posted' ? ' posted' : '');
  row.setAttribute('data-highlight-id', clip.id);
  const dots = clip.catTags.map(c => '<span class="cat-dot" title="' + escapeHtml(c) + '" style="--cat-color:' + CAT_PROFILES[c].bg + '"></span>').join('');
  const meta = [];
  if (o.showStage) meta.push(STATUS_LABELS[clip.status]);
  if (clip.scheduledDate) meta.push((isOverdue(clip) ? '⚠ ' : '') + formatDateLong(clip.scheduledDate));
  if (clip.archived) meta.push('Archived');
  row.innerHTML =
    '<span class="clip-row-strip" aria-hidden="true"></span>' +
    '<span class="clip-row-main">' +
      '<span class="clip-row-text">' + escapeHtml(clip.desc || 'Untitled') + '</span>' +
      '<span class="clip-row-meta">' + (dots ? '<span class="clip-row-cats">' + dots + '</span>' : '') +
        (meta.length ? '<span>' + escapeHtml(meta.join(' · ')) + '</span>' : '') + '</span>' +
    '</span>';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'clip-row-copy';
  copy.title = 'Copy caption';
  copy.innerHTML = NAV_ICONS.copy;
  copy.onclick = (e) => { e.stopPropagation(); copyWithIconFeedback(clip.desc, copy); };
  row.appendChild(copy);
  row.onclick = () => openCardModal(clip.id, row);
  makePressable(row, clip.desc || 'Untitled card');
  return row;
}

// ===== Focused card: tapping a card "picks it out" =====
// The card grows from its slot in the deck into the centre of the screen. FLIP: measure the deck
// card and the final card, then animate a transform (uniform scale, so text isn't squashed) plus a
// clip-path that unfolds the part of the card that wasn't visible in the deck.

function deckToFocusFrames(from, to) {
  const s = from.width / to.width;
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const hiddenBottom = Math.max(0, to.height - from.height / s);
  return [
    {
      transform: `translate(${dx}px, ${dy}px) scale(${s})`,
      clipPath: `inset(0px 0px ${hiddenBottom}px 0px round ${18 / s}px)`,
      boxShadow: '0 -6px 18px -8px rgba(0,0,0,0.35)'
    },
    {
      transform: 'translate(0px, 0px) scale(1)',
      clipPath: 'inset(0px 0px 0px 0px round 18px)',
      boxShadow: '0 40px 80px -30px rgba(0,0,0,0.75)'
    }
  ];
}

function fillFocusCard(box, clip) {
  box.innerHTML = '';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '✕';
  closeBtn.title = 'Put it back';
  closeBtn.onclick = () => closeCardModal();
  box.appendChild(closeBtn);
  box.appendChild(buildStackHead(clip));
  box.appendChild(buildFullCard(clip));
}

// sourceEl: the element that was tapped. A deck card flies out; anything else just fades in.
function openCardModal(id, sourceEl) {
  const overlay = document.getElementById('cardModalOverlay');
  const box = document.getElementById('cardModalBox');
  const clip = clips.find(c => c.id === id);
  if (!clip) return;

  const alreadyOpen = overlay.classList.contains('open') && overlay.dataset.clipId === id;
  const keepScroll = box.scrollTop;
  const colorIdx = clipColorIndex(clip);
  box.className = 'modal-box focus-card surface c' + colorIdx;
  box.dataset.color = colorIdx;
  fillFocusCard(box, clip);

  if (alreadyOpen) { box.scrollTop = keepScroll; return; } // re-render in place after an edit

  overlay.dataset.clipId = id;
  overlay.classList.remove('closing');
  overlay.classList.add('open');
  document.documentElement.classList.add('focus-open');
  box.scrollTop = 0;

  // Full cards and library tiles grow out of their spot; rows just fade in
  const fromDeck = sourceEl && (sourceEl.classList.contains('stack-card') || sourceEl.classList.contains('lib-tile'));
  if (fromDeck && !prefersReducedMotion()) {
    const from = sourceEl.getBoundingClientRect();
    const to = box.getBoundingClientRect();
    sourceEl.classList.add('picked');
    box.animate(deckToFocusFrames(from, to), { duration: 460, easing: 'cubic-bezier(.2,.9,.25,1)' });
  } else {
    if (fromDeck) sourceEl.classList.add('picked');
    box.animate(
      [{ opacity: 0, transform: 'translateY(24px) scale(0.96)' }, { opacity: 1, transform: 'none' }],
      { duration: prefersReducedMotion() ? 1 : 260, easing: 'cubic-bezier(.2,.9,.25,1)' }
    );
  }
}

// Puts the card back into its slot in the deck. Pass skipFlyBack when the card is leaving the
// deck (archived/deleted) so it fades instead of flying into a slot that's about to disappear.
function closeCardModal(skipFlyBack) {
  const overlay = document.getElementById('cardModalOverlay');
  const box = document.getElementById('cardModalBox');
  if (!overlay.classList.contains('open') || overlay.classList.contains('closing')) return;
  const id = overlay.dataset.clipId;

  const finish = (anim) => {
    overlay.classList.remove('open', 'closing');
    overlay.removeAttribute('data-clip-id');
    document.documentElement.classList.remove('focus-open');
    document.querySelectorAll('.picked').forEach(el => el.classList.remove('picked'));
    if (anim) anim.cancel();
  };
  overlay.classList.add('closing');

  // The deck may have re-rendered while the card was open, so look up its slot now.
  const sel = '[data-highlight-id="' + CSS.escape(id || '') + '"]';
  const target = id && document.querySelector('.app-view:not([hidden]) .stack-card' + sel + ', .app-view:not([hidden]) .lib-tile' + sel);
  const from = target ? target.getBoundingClientRect() : null;
  const slotVisible = from && from.height > 0 && from.bottom > 0 && from.top < window.innerHeight;
  if (!skipFlyBack && slotVisible && !prefersReducedMotion()) {
    box.scrollTop = 0;
    const to = box.getBoundingClientRect();
    target.classList.add('picked');
    const anim = box.animate(deckToFocusFrames(from, to).reverse(), { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    anim.onfinish = () => finish(anim);
    return;
  }
  const anim = box.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(24px) scale(0.96)' }],
    { duration: prefersReducedMotion() ? 1 : 200, fill: 'forwards' }
  );
  anim.onfinish = () => finish(anim);
}

function refreshOpenModal() {
  const overlay = document.getElementById('cardModalOverlay');
  if (overlay.classList.contains('open') && !overlay.classList.contains('closing') && overlay.dataset.clipId) {
    openCardModal(overlay.dataset.clipId);
  }
}

document.getElementById('cardModalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'cardModalOverlay') closeCardModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCardModal();
});
