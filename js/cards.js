// Card rendering (deck, list, open card) and the pick-out / put-back animation.

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

// Editor shown inside a picked-out card. The card's own header (cats, date, status) sits above it.
function buildFullCard(clip) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-highlight-id', clip.id);
  if (!clip.selectedTones) clip.selectedTones = ['Deadpan nature-doc'];

  // The caption itself
  const top = document.createElement('div');
  top.className = 'card-top';
  const descWrap = document.createElement('div');
  descWrap.className = 'card-desc-wrap';
  const desc = document.createElement('div');
  desc.className = 'card-desc';
  desc.textContent = clip.desc;
  descWrap.appendChild(desc);
  const descCopyBtn = document.createElement('button');
  descCopyBtn.className = 'desc-copy-btn';
  descCopyBtn.title = 'Copy caption';
  descCopyBtn.innerHTML = NAV_ICONS.copy;
  descCopyBtn.onclick = (e) => { e.stopPropagation(); copyWithIconFeedback(clip.desc, descCopyBtn); };
  descWrap.appendChild(descCopyBtn);
  top.appendChild(descWrap);
  card.appendChild(top);

  // Who's in it
  const starLabel = document.createElement('div');
  starLabel.className = 'field-label';
  starLabel.style.marginTop = '16px';
  starLabel.textContent = 'Starring';
  card.appendChild(starLabel);
  const catRow = document.createElement('div');
  fillCatPicker(catRow, clip.catTags || [], cat => toggleClipCat(clip.id, cat));
  card.appendChild(catRow);

  const dateLabel = document.createElement('div');
  dateLabel.className = 'field-label';
  dateLabel.style.marginTop = '16px';
  dateLabel.textContent = 'Post date';
  card.appendChild(dateLabel);
  card.appendChild(buildDateChip(clip.scheduledDate, (v) => { setScheduledDate(clip.id, v); refreshOpenModal(); }));

  // Tones, then the button that uses them, then the options it produced
  const toneLabel = document.createElement('div');
  toneLabel.className = 'field-label';
  toneLabel.style.marginTop = '16px';
  toneLabel.textContent = 'Tone (pick one or more)';
  card.appendChild(toneLabel);
  const toneRow = document.createElement('div');
  toneRow.className = 'tone-row';
  TONES.forEach(tone => toneRow.appendChild(buildToneChip(tone, clip.selectedTones.includes(tone), () => { toggleTone(clip.id, tone); refreshOpenModal(); })));
  card.appendChild(toneRow);

  const genRow = document.createElement('div');
  genRow.className = 'card-bottom-row';
  const genBtn = document.createElement('button');
  genBtn.className = 'gen-caption-btn';
  genBtn.textContent = clip.captions ? 'Shuffle captions' : 'Draft captions';
  genBtn.onclick = () => generateCaptions(clip.id);
  genRow.appendChild(genBtn);
  card.appendChild(genRow);

  if (clip.captions) {
    const box = document.createElement('div');
    box.className = 'captions-box';
    const usedTones = clip.captionTones || [];
    // Always the current sets from Settings, so editing them applies to every card
    const igHashtags = hashtagsFor('Instagram');
    const ttHashtags = hashtagsFor('TikTok');
    (clip.captions.captions || []).forEach((cap, i) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'caption-opt';
      const topRow = document.createElement('div');
      topRow.className = 'caption-opt-top';
      const tag = document.createElement('span');
      tag.className = 'copy-tag';
      tag.textContent = 'Option ' + (i + 1) + (usedTones[i] ? ' | ' + usedTones[i] : '');
      const copyBtnGroup = document.createElement('div');
      copyBtnGroup.className = 'platform-copy-group';
      const igCopyBtn = document.createElement('button');
      igCopyBtn.className = 'platform-copy-btn';
      igCopyBtn.title = 'Copy with Instagram hashtags';
      igCopyBtn.innerHTML = NAV_ICONS.instagram;
      igCopyBtn.onclick = () => copyWithIconFeedback(igHashtags ? (cap + '\n\n' + igHashtags) : cap, igCopyBtn);
      const ttCopyBtn = document.createElement('button');
      ttCopyBtn.className = 'platform-copy-btn';
      ttCopyBtn.title = 'Copy with TikTok hashtags';
      ttCopyBtn.innerHTML = NAV_ICONS.tiktok;
      ttCopyBtn.onclick = () => copyWithIconFeedback(ttHashtags ? (cap + '\n\n' + ttHashtags) : cap, ttCopyBtn);
      copyBtnGroup.appendChild(igCopyBtn);
      copyBtnGroup.appendChild(ttCopyBtn);
      topRow.appendChild(tag);
      topRow.appendChild(copyBtnGroup);
      optDiv.appendChild(topRow);
      const capText = document.createElement('div');
      capText.textContent = cap;
      optDiv.appendChild(capText);
      box.appendChild(optDiv);
    });
    card.appendChild(box);
  }

  const brandRow = buildBrandInlineSelect(clip.brandId, (id) => { clip.brandId = id; saveClips(clip.id); render(); });
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

function buildListTile(clip) {
  const tile = document.createElement('div');
  tile.className = 'list-tile';
  tile.setAttribute('data-highlight-id', clip.id);

  if (selectMode) {
    if (selectedClipIds.has(clip.id)) tile.classList.add('selected');
    const check = document.createElement('div');
    check.className = 'tile-select-check';
    check.innerHTML = NAV_ICONS.checkSquare;
    tile.appendChild(check);
  }

  const stamp = document.createElement('div');
  stamp.className = 'stamp ' + clip.status;
  stamp.textContent = STATUS_LABELS[clip.status];
  tile.appendChild(stamp);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'tile-copy-btn';
  copyBtn.title = 'Quick copy';
  copyBtn.innerHTML = NAV_ICONS.copy;
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    let textToCopy = clip.desc;
    if (clip.captions && clip.captions.captions && clip.captions.captions[0]) {
      const tags = clip.platform === 'TikTok'
        ? hashtagsFor('TikTok')
        : hashtagsFor('Instagram');
      textToCopy = clip.captions.captions[0] + (tags ? '\n\n' + tags : '');
    }
    copyWithIconFeedback(textToCopy, copyBtn);
  };
  tile.appendChild(copyBtn);

  const desc = document.createElement('div');
  desc.className = 'list-tile-desc';
  desc.textContent = clip.desc;
  tile.appendChild(desc);

  if (clip.brandId) {
    const b = brands.find(x => x.id === clip.brandId);
    if (b) {
      const brandTag = document.createElement('div');
      brandTag.style.cssText = 'font-family:\'Space Mono\',monospace; font-size:9.5px; color:var(--moss-dark); margin-top:-4px; margin-bottom:6px;';
      brandTag.textContent = '🏷 ' + b.name;
      tile.insertBefore(brandTag, desc.nextSibling);
    }
  }

  if (clip.catTags && clip.catTags.length) {
    const catTag = document.createElement('div');
    catTag.style.cssText = 'font-family:\'Space Mono\',monospace; font-size:9.5px; color:var(--ink-soft); margin-top:-4px; margin-bottom:6px;';
    catTag.textContent = '🐾 ' + clip.catTags.join(', ');
    tile.insertBefore(catTag, desc.nextSibling);
  }

  if (clip.archived) {
    const archivedTag = document.createElement('div');
    archivedTag.style.cssText = 'font-family:\'Space Mono\',monospace; font-size:9px; color:var(--ink-soft); margin-top:4px;';
    archivedTag.textContent = '📦 archived';
    tile.appendChild(archivedTag);
  }

  const footer = document.createElement('div');
  footer.className = 'list-tile-footer';
  let footerText;
  if (clip.scheduledDate) {
    footerText = '📅 ' + formatDateLong(clip.scheduledDate);
  } else if (clip.captions) {
    footerText = '💬 tap to see all captions';
  } else if (clip.status === 'posted') {
    footerText = ''; // e.g. imported history: when it was logged says nothing about when it went up
  } else {
    footerText = timeAgo(clip.created);
  }
  footer.textContent = footerText;
  tile.appendChild(footer);

  makePressable(tile, clip.desc || 'Untitled card');
  tile.onclick = () => {
    if (selectMode) {
      toggleClipSelection(clip.id);
    } else {
      openCardModal(clip.id);
    }
  };
  return tile;
}

// Each clip gets a stable card color (0–6) from its id, so it looks the same in the deck,
// the calendar and when focused.
function clipColorIndex(clip) {
  let h = 0;
  for (const ch of String(clip.id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 7;
}

let suppressCardClick = false;

// Wallet-style card for the stacked Home view. `index` drives how far down it sticks.
function buildStackCard(clip, index, colorIdx) {
  const card = document.createElement('div');
  card.className = 'stack-card c' + colorIdx;
  card.dataset.color = colorIdx;
  card.setAttribute('data-highlight-id', clip.id);
  // Each card sticks 10px lower than the last, so no two deck cards rest on the same spot.
  card.style.setProperty('--stack-off', (Math.min(index, DECK_MAX - 1) * 10) + 'px');
  if (selectMode && selectedClipIds.has(clip.id)) card.classList.add('selected');
  // Keep its slot empty if this card is currently picked out (the deck re-renders on edits)
  if (document.getElementById('cardModalOverlay').dataset.clipId === clip.id) card.classList.add('picked');

  const caps = (clip.captions && clip.captions.captions) || [];
  const brand = clip.brandId ? brands.find(b => b.id === clip.brandId) : null;

  card.appendChild(buildStackHead(clip));

  // The caption itself, once, readable in full
  const body = document.createElement('div');
  body.className = 'stack-body';
  const bodyText = document.createElement('div');
  bodyText.className = 'stack-body-text';
  bodyText.textContent = clip.desc || 'Untitled';
  body.appendChild(bodyText);
  card.appendChild(body);

  // Small tags for everything else; the header's right side already shows date or caption count
  const foot = document.createElement('div');
  foot.className = 'stack-foot';
  const tagWrap = document.createElement('div');
  tagWrap.className = 'stack-foot-tags';
  const tags = [];
  if (isOverdue(clip)) tags.push('⚠ Overdue');
  if (caps.length && clip.scheduledDate) tags.push(caps.length + ' captions');
  if (!caps.length && clip.status !== 'posted') tags.push('No captions yet');
  if (brand) tags.push('🏷 ' + brand.name);
  if (clip.archived) tags.push('Archived');
  if (!tags.length && clip.status !== 'posted') tags.push('Logged ' + timeAgo(clip.created));
  tags.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'stack-tag' + (t.startsWith('⚠') ? ' warn' : '');
    chip.textContent = t;
    tagWrap.appendChild(chip);
  });
  foot.appendChild(tagWrap);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'stack-copy-btn';
  copyBtn.title = caps.length ? 'Copy caption + hashtags' : 'Copy description';
  copyBtn.innerHTML = NAV_ICONS.copy;
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    let text = clip.desc;
    if (caps.length) {
      // Same post everywhere now, so quick copy uses the Instagram hashtag set
      const tagsText = hashtagsFor('Instagram');
      text = caps[0] + (tagsText ? '\n\n' + tagsText : '');
    }
    copyWithIconFeedback(text, copyBtn);
  };
  foot.appendChild(copyBtn);
  card.appendChild(foot);

  card.onclick = () => {
    if (suppressCardClick) { suppressCardClick = false; return; }
    if (selectMode) toggleClipSelection(clip.id);
    else openCardModal(clip.id, card);
  };
  // Long-press a card to start selecting (replaces the old header button)
  let pressTimer = null;
  const cancelPress = () => { clearTimeout(pressTimer); pressTimer = null; };
  card.addEventListener('pointerdown', (e) => {
    if (selectMode || e.button > 0) return;
    pressTimer = setTimeout(() => {
      // The deck re-renders below, so the release's click may land on the new card element
      suppressCardClick = true;
      document.addEventListener('pointerup', () => setTimeout(() => { suppressCardClick = false; }, 60), { once: true });
      if (navigator.vibrate) navigator.vibrate(15);
      toggleQuickFilter(null);
      toggleSelectMode();
      toggleClipSelection(clip.id);
    }, 550);
  });
  ['pointerup', 'pointerleave', 'pointercancel', 'pointermove'].forEach(ev => card.addEventListener(ev, (e) => {
    if (ev === 'pointermove' && Math.abs(e.movementY) + Math.abs(e.movementX) < 3) return;
    cancelPress();
  }));
  card.addEventListener('contextmenu', (e) => e.preventDefault());
  makePressable(card, clip.desc || 'Untitled card');
  return card;
}

// Icon + status/platform kicker + title + date/count — shared by deck cards and the focused card.
function buildStackHead(clip, editable) {
  const caps = (clip.captions && clip.captions.captions) || [];
  let sideLabel, sideValue;
  if (clip.scheduledDate) {
    const [y, m, d] = clip.scheduledDate.split('-').map(Number);
    sideLabel = 'Posts';
    sideValue = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (clip.status === 'posted') {
    // e.g. imported history: no date, so say where it went up rather than when it was logged
    sideLabel = 'Posted on';
    sideValue = clip.platform === 'Both' ? 'IG + TikTok' : clip.platform;
  } else if (caps.length) {
    sideLabel = 'Captions';
    sideValue = String(caps.length);
  } else {
    sideLabel = 'Logged';
    const days = Math.floor((Date.now() - new Date(clip.created).getTime()) / 86400000);
    sideValue = days <= 0 ? 'Today' : days + 'd';
  }

  // Cats on the left, date / caption count on the right, status chip underneath.
  // In the open card (editable) the status chip is the one place to change status.
  const wrap = document.createElement('div');
  wrap.className = 'stack-headwrap';
  const head = document.createElement('div');
  head.className = 'stack-head';
  head.innerHTML = catStackHtml(clip.catTags) +
    '<div class="stack-side">' +
      '<div class="stack-side-label">' + sideLabel + '</div>' +
      '<div class="stack-side-value">' + escapeHtml(sideValue) + '</div>' +
    '</div>';
  wrap.appendChild(head);

  let chip;
  if (editable) {
    chip = document.createElement('label');
    chip.className = 'status-chip status-chip-edit ' + clip.status;
    chip.title = 'Change status';
    const sel = document.createElement('select');
    STATUSES.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = STATUS_LABELS[s];
      if (s === clip.status) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = () => { updateStatus(clip.id, sel.value); refreshOpenModal(); };
    // Looks like the plain chip; an invisible native select on top opens the phone's picker
    chip.innerHTML = '<span class="status-dot"></span>' + escapeHtml(STATUS_LABELS[clip.status] || clip.status) + '<span class="status-caret">▾</span>';
    chip.appendChild(sel);
  } else {
    chip = document.createElement('span');
    chip.className = 'status-chip ' + clip.status;
    chip.innerHTML = '<span class="status-dot"></span>' + escapeHtml(STATUS_LABELS[clip.status] || clip.status);
  }
  wrap.appendChild(chip);
  return wrap;
}

// ===== Focused card: tapping a deck card "picks it out" =====
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
  box.appendChild(buildStackHead(clip, true));
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
  let colorIdx = clipColorIndex(clip);
  if (sourceEl && sourceEl.dataset.color != null) colorIdx = Number(sourceEl.dataset.color);
  else if (alreadyOpen && box.dataset.color != null) colorIdx = Number(box.dataset.color);
  box.className = 'modal-box focus-card surface c' + colorIdx;
  box.dataset.color = colorIdx;
  fillFocusCard(box, clip);

  if (alreadyOpen) { box.scrollTop = keepScroll; return; } // re-render in place after an edit

  overlay.dataset.clipId = id;
  overlay.classList.remove('closing');
  overlay.classList.add('open');
  document.documentElement.classList.add('focus-open');
  box.scrollTop = 0;

  const fromDeck = sourceEl && sourceEl.classList.contains('stack-card');
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
    document.querySelectorAll('.stack-card.picked').forEach(el => el.classList.remove('picked'));
    if (anim) anim.cancel();
  };
  overlay.classList.add('closing');

  // The deck may have re-rendered while the card was open, so look up its slot now.
  const target = id && document.querySelector('#cardList .stack-card[data-highlight-id="' + CSS.escape(id) + '"], #cardOverflowList .stack-card[data-highlight-id="' + CSS.escape(id) + '"]');
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
