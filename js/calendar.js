// Calendar: week and month views, unscheduled tray, drag to schedule.

// ===== Calendar: week view (default on phones) or month grid, both Monday-first like the
// weekly goal. Unscheduled cards sit in a tray and can be dragged onto a day; in week view,
// planned cards can be dragged to another day.
let calView = 'month';

try { calView = localStorage.getItem('tsc-cal-view') || (window.matchMedia('(max-width: 600px)').matches ? 'week' : 'month'); } catch (e) {}

let calWeekOffset = 0;

const POSTING_DAYS = [0, 2, 4];

 // Mon, Wed, Fri: marked in week view

function calItemHtml(c, showDate) {
  return '<div class="cal-item c' + clipColorIndex(c) + (c.status === 'posted' ? ' posted' : '') + '" data-clip-id="' + escapeHtml(c.id) + '">' +
    (c.status === 'posted' ? '' : '<span class="drag-handle" title="Drag onto a day" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></span>') +
    '<span class="cal-item-text">' + escapeHtml(c.desc || 'Untitled') + '</span>' +
    '<span class="cal-item-status">' + escapeHtml(STATUS_LABELS[c.status] || c.status) + '</span>' +
    '</div>';
}

function renderCalendar() {
  const container = document.getElementById('calendarView');
  const today = localToday();
  const visible = getFilteredClips();
  const byDate = {};
  visible.forEach(c => { if (c.scheduledDate) (byDate[c.scheduledDate] = byDate[c.scheduledDate] || []).push(c); });
  const unscheduled = visible.filter(c => !c.scheduledDate && c.status !== 'posted');

  let title, body;
  if (calView === 'week') {
    const monday = addDays(mondayOf(today), calWeekOffset * 7);
    const sunday = addDays(monday, 6);
    const fmt = (d, opts) => parseDay(d).toLocaleDateString('en-US', opts);
    title = fmt(monday, { month: 'short', day: 'numeric' }) + ' – ' +
      (monday.slice(5, 7) === sunday.slice(5, 7) ? fmt(sunday, { day: 'numeric' }) : fmt(sunday, { month: 'short', day: 'numeric' }));
    body = '<div class="cal-week">';
    for (let i = 0; i < 7; i++) {
      const day = addDays(monday, i);
      const posts = byDate[day] || [];
      body += '<div class="cal-day' + (day === today ? ' today' : '') + (day < today ? ' past' : '') + '" data-date="' + day + '">' +
        '<div class="cal-day-head">' +
          '<span class="cal-day-name">' + fmt(day, { weekday: 'short' }) + (POSTING_DAYS.includes(i) ? '<span class="cal-posting-day" title="Posting day"></span>' : '') + '</span>' +
          '<span class="cal-day-num">' + parseDay(day).getDate() + '</span>' +
          '<span class="cal-day-add" aria-hidden="true">+</span>' +
        '</div>' +
        '<div class="cal-day-posts">' + (posts.length ? posts.map(c => calItemHtml(c)).join('') : '') + '</div>' +
      '</div>';
    }
    body += '</div>';
  } else {
    const now = new Date();
    const viewDate = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    title = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    body = '<div class="cal-grid">';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => { body += '<div class="cal-dow">' + d + '</div>'; });
    for (let i = 0; i < firstDow; i++) body += '<div class="cal-cell empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      body += '<div class="cal-cell' + (dateStr === today ? ' today' : '') + '" data-date="' + dateStr + '">';
      body += '<div class="cal-daynum">' + day + '</div>';
      (byDate[dateStr] || []).forEach(c => {
        body += '<div class="cal-post ' + c.status + ' c' + clipColorIndex(c) + '" data-clip-id="' + escapeHtml(c.id) + '" title="' + escapeHtml(c.desc) + '">' + escapeHtml(c.desc) + '</div>';
      });
      body += '</div>';
    }
    const trailing = (7 - ((firstDow + daysInMonth) % 7)) % 7;
    for (let i = 0; i < trailing; i++) body += '<div class="cal-cell empty"></div>';
    body += '</div>';
    container.style.setProperty('--cal-weeks', Math.ceil((firstDow + daysInMonth) / 7));
  }

  let html = '<div class="cal-header">' +
    '<h2>' + escapeHtml(title) + '</h2>' +
    '<div class="chip-row cal-view-toggle" role="group" aria-label="Calendar view">' +
      ['week', 'month'].map(v => '<button type="button" class="chip' + (calView === v ? ' selected' : '') + '" aria-pressed="' + (calView === v) + '" data-cal-view="' + v + '">' + (v === 'week' ? 'Week' : 'Month') + '</button>').join('') +
    '</div>' +
  '</div>' +
  '<div class="nav-btns cal-nav"><button id="calPrev" aria-label="Previous">‹</button><button id="calToday">Today</button><button id="calNext" aria-label="Next">›</button></div>';
  if (unscheduled.length) {
    html += '<div class="cal-tray"><div class="cal-tray-label">Unscheduled · drag onto a day</div>' +
      '<div class="cal-tray-items">' + unscheduled.map(c => calItemHtml(c)).join('') + '</div></div>';
  }
  container.innerHTML = html + body;
  container.classList.toggle('cal-mode-week', calView === 'week');

  const step = (dir) => { if (calView === 'week') calWeekOffset += dir; else calMonthOffset += dir; renderCalendar(); };
  document.getElementById('calPrev').onclick = () => step(-1);
  document.getElementById('calNext').onclick = () => step(1);
  document.getElementById('calToday').onclick = () => { calWeekOffset = 0; calMonthOffset = 0; renderCalendar(); };
  container.querySelectorAll('[data-cal-view]').forEach(b => b.onclick = () => {
    calView = b.dataset.calView;
    try { localStorage.setItem('tsc-cal-view', calView); } catch (e) {}
    renderCalendar();
  });

  container.querySelectorAll('.cal-post, .cal-item').forEach(el => {
    makePressable(el, el.querySelector('.cal-item-text') ? el.querySelector('.cal-item-text').textContent : el.textContent);
    el.onclick = (e) => { e.stopPropagation(); if (!calDragJustEnded) openCardModal(el.dataset.clipId); };
  });
  container.querySelectorAll('[data-date]').forEach(cell => {
    cell.title = 'Log a clip for ' + formatDateLong(cell.dataset.date);
    cell.onclick = () => {
      if (calDragJustEnded) return;
      newClipDate = cell.dataset.date;
      renderNewClipDateRow();
      openEntrySheet();
    };
  });
  container.querySelectorAll('.drag-handle').forEach(h => h.addEventListener('pointerdown', startCalendarDrag));
}

// ----- Dragging a card onto a day -----
// Starts from the grip handle (which has touch-action: none) so the rest of the calendar still
// scrolls normally on a phone. The card follows the finger and the day under it lights up.
let calDrag = null;

let calDragJustEnded = false;

function startCalendarDrag(e) {
  if (e.button > 0) return;
  const item = e.currentTarget.closest('[data-clip-id]');
  if (!item) return;
  e.preventDefault();
  e.stopPropagation();
  const r = item.getBoundingClientRect();
  const ghost = item.cloneNode(true);
  ghost.classList.add('drag-ghost');
  Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
  document.body.appendChild(ghost);
  item.classList.add('dragging');
  // The floating nav would cover the bottom days, so it steps aside while dragging
  document.body.classList.add('cal-dragging');
  const handle = e.currentTarget;
  calDrag = { id: item.dataset.clipId, item, ghost, handle, dx: e.clientX - r.left, dy: e.clientY - r.top, target: null };
  try { handle.setPointerCapture(e.pointerId); } catch (err) {}
  handle.addEventListener('pointermove', moveCalendarDrag);
  handle.addEventListener('pointerup', endCalendarDrag);
  handle.addEventListener('pointercancel', cancelCalendarDrag);
  if (navigator.vibrate) navigator.vibrate(10);
}

function moveCalendarDrag(e) {
  if (!calDrag) return;
  calDrag.ghost.style.left = (e.clientX - calDrag.dx) + 'px';
  calDrag.ghost.style.top = (e.clientY - calDrag.dy) + 'px';
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const target = under && under.closest('#calendarView [data-date]');
  if (target !== calDrag.target) {
    if (calDrag.target) calDrag.target.classList.remove('drop-target');
    if (target) target.classList.add('drop-target');
    calDrag.target = target;
  }
  // Scroll when dragging near the top or bottom edge
  const edge = 70;
  const dy = e.clientY < edge ? -14 : e.clientY > window.innerHeight - edge ? 14 : 0;
  if (dy) {
    const cal = document.getElementById('calendarView');
    if (cal.scrollHeight > cal.clientHeight) cal.scrollBy(0, dy); else window.scrollBy(0, dy);
  }
}

function finishCalendarDrag() {
  const d = calDrag;
  calDrag = null;
  d.handle.removeEventListener('pointermove', moveCalendarDrag);
  d.handle.removeEventListener('pointerup', endCalendarDrag);
  d.handle.removeEventListener('pointercancel', cancelCalendarDrag);
  d.ghost.remove();
  d.item.classList.remove('dragging');
  document.body.classList.remove('cal-dragging');
  if (d.target) d.target.classList.remove('drop-target');
  // The pointerup can also fire a click on whatever is underneath; ignore it
  calDragJustEnded = true;
  setTimeout(() => { calDragJustEnded = false; }, 80);
  return d;
}

function endCalendarDrag() {
  if (!calDrag) return;
  const d = finishCalendarDrag();
  if (d.target) scheduleClipOn(d.id, d.target.dataset.date);
}

function cancelCalendarDrag() {
  if (calDrag) finishCalendarDrag();
}

function scheduleClipOn(id, day) {
  const c = clips.find(x => x.id === id);
  if (!c || c.scheduledDate === day) return;
  const prev = { date: c.scheduledDate, status: c.status };
  setScheduledDate(id, day);
  showToast('Scheduled for ' + formatDateLong(day), {
    onUndo: () => { c.scheduledDate = prev.date; c.status = prev.status; saveClips(id); render(); }
  });
}
