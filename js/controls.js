// Shared form controls: date chips and picker, quiet brand select, cat and pillar chips.

// A chip that opens the phone's own date picker. One hidden <input type="date"> is reused and
// placed over the tapped chip so the picker anchors there.
function openDatePicker(anchor, value, onPick) {
  let input = document.getElementById('datePickerProxy');
  if (!input) {
    input = document.createElement('input');
    input.type = 'date';
    input.id = 'datePickerProxy';
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      input.classList.remove('fallback');
      if (input._onPick && input.value) input._onPick(input.value);
    });
    input.addEventListener('blur', () => input.classList.remove('fallback'));
  }
  const r = anchor.getBoundingClientRect();
  Object.assign(input.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  input.value = value || '';
  input._onPick = onPick;
  input.classList.remove('fallback');
  try {
    input.showPicker();
  } catch (e) {
    // Older browsers: show the native field over the chip instead
    input.classList.add('fallback');
    input.focus();
  }
}

// Post date: one-tap Today, Tomorrow and the day after (short weekday name), plus a chip for any other date.
// Tapping a selected quick pick clears it again.
function buildDateChip(value, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'chip-row';
  const quick = [localDay(0), localDay(1), localDay(2)];
  quick.forEach((day, i) => {
    const [y, m, d] = day.split('-').map(Number);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip date-quick' + (value === day ? ' selected' : '');
    chip.setAttribute('aria-pressed', value === day ? 'true' : 'false');
    chip.title = formatDateLong(day);
    chip.textContent = label;
    chip.onclick = () => onChange(value === day ? '' : day);
    wrap.appendChild(chip);
  });
  const custom = value && !quick.includes(value);
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip date-chip' + (custom ? ' selected' : '');
  chip.innerHTML = NAV_ICONS.calendar + '<span>' + (custom ? escapeHtml(formatDateLong(value)) : 'Pick date') + '</span>';
  chip.onclick = () => openDatePicker(chip, value, onChange);
  wrap.appendChild(chip);
  if (custom) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'chip chip-clear';
    clear.title = 'Remove date';
    clear.textContent = '✕';
    clear.onclick = () => onChange('');
    wrap.appendChild(clear);
  }
  return wrap;
}

// Quiet "Brand: None ▾" line: an invisible native select over the text opens the phone's picker
function syncInlineSelect(label) {
  const sel = label.querySelector('select');
  const opt = sel.options[sel.selectedIndex];
  label.querySelector('.inline-select-value').textContent = opt ? opt.textContent : 'None';
  label.classList.toggle('has-value', !!sel.value);
}

function buildBrandInlineSelect(selectedId, onChange) {
  const label = document.createElement('label');
  label.className = 'inline-select';
  label.innerHTML = '<span class="inline-select-label">Brand</span><span class="inline-select-value"></span><span class="status-caret">▾</span>';
  const sel = document.createElement('select');
  sel.setAttribute('aria-label', 'Brand');
  label.appendChild(sel);
  fillBrandOptions(sel, 'None');
  sel.value = brands.some(b => b.id === selectedId) ? selectedId : '';
  sel.onchange = () => { syncInlineSelect(label); onChange(sel.value); };
  syncInlineSelect(label);
  return label;
}

// Starring: the four cats as avatars, greyed out until picked. Picked ones also show at the
// top of the card.
function fillCatPicker(container, selected, onToggle) {
  container.innerHTML = '';
  container.classList.remove('chip-row');
  container.classList.add('cat-picker');
  CATS.forEach(cat => {
    const on = selected.includes(cat);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-pick' + (on ? ' on' : '');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.innerHTML = '<span class="cat-avatar">' + catAvatarSvg(cat, !on) + '</span>' +
      '<span class="cat-pick-name">' + escapeHtml(cat) + '</span>' +
      '<span class="cat-pick-sub">' + escapeHtml(CAT_PROFILES[cat].breed) + '</span>';
    btn.onclick = () => onToggle(cat);
    container.appendChild(btn);
  });
}

// One-pick pillar chips, each in its own card colour. Tapping the selected one clears it.
function fillPillarPicker(container, selected, onPick) {
  container.innerHTML = '';
  container.classList.add('chip-row', 'pillar-row');
  PILLARS.forEach(p => {
    const on = selected === p.key;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip pillar-chip c' + p.color + (on ? ' selected' : '');
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    chip.innerHTML = pillarIconSvg(p.key) + '<span>' + escapeHtml(p.label) + '</span>';
    chip.onclick = () => onPick(on ? '' : p.key);
    container.appendChild(chip);
  });
}

// Idea / Planned / Posted as one segmented control
function buildStageToggle(value, onPick) {
  const wrap = document.createElement('div');
  wrap.className = 'stage-toggle';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Stage');
  STATUSES.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stage-btn ' + s + (value === s ? ' selected' : '');
    b.setAttribute('aria-pressed', value === s ? 'true' : 'false');
    b.textContent = STATUS_LABELS[s];
    b.onclick = () => { if (value !== s) onPick(s); };
    wrap.appendChild(b);
  });
  return wrap;
}
