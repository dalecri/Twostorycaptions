// Shared form controls: date chips and picker, quiet brand select, tone and cat chips.

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

function buildToneChip(tone, selected, onToggle) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'tone-chip' + (selected ? ' selected' : '');
  chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
  const icon = TONE_ICON_PATHS[tone]
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TONE_ICON_PATHS[tone] + '</svg>'
    : '';
  chip.innerHTML = icon + '<span>' + escapeHtml(tone) + '</span>';
  chip.onclick = onToggle;
  return chip;
}

// Tap-to-toggle cat profiles (new-caption sheet and the open card)
function fillCatPicker(container, selected, onToggle) {
  container.innerHTML = '';
  container.classList.add('chip-row');
  CATS.forEach(cat => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip cat-chip' + (selected.includes(cat) ? ' selected' : '');
    chip.setAttribute('aria-pressed', selected.includes(cat) ? 'true' : 'false');
    chip.style.setProperty('--cat-color', (CAT_PROFILES[cat] || {}).bg || '#CCCCCC');
    chip.innerHTML = '<span class="cat-dot" aria-hidden="true"></span>' + escapeHtml(cat);
    chip.onclick = () => onToggle(cat);
    container.appendChild(chip);
  });
}
