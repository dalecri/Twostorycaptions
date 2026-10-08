// Plan: day, week and month views, a tray of undated posts (and bank ideas on request), drag to schedule.

// ===== Day view (default on phones): a week strip to pick the day and that day's posts on a
// timeline. Week and month views list or grid the posts. All are Monday-first like the weekly goal.
// Undated cards sit in a tray and can be dragged onto a day.
const CAL_VIEWS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month']];

let calView = 'month';

// v2 key so everyone on a phone lands on the new day view once
try { calView = localStorage.getItem('tsc-cal-view-v2') || (window.matchMedia('(max-width: 600px)').matches ? 'day' : 'month'); } catch (e) {}

if (!CAL_VIEWS.some(([v]) => v === calView)) calView = 'day';

// The day open in day view
let calDay = '';

let calWeekOffset = 0;

// Shows a few bank ideas in the tray so they can be dragged straight onto a day
let calTrayIdeas = false;

const POSTING_DAYS = [0, 2, 4];

 // Mon, Wed, Fri: marked in week view

function calItemHtml(c, showDate) {
  return '<div class="cal-item c' + clipColorIndex(c) + (c.status === 'posted' ? ' posted' : '') + '" data-clip-id="' + escapeHtml(c.id) + '">' +
    (c.status === 'posted' ? '' : '<span class="drag-handle" title="Drag onto a day" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></span>') +
    '<span class="cal-item-text">' + escapeHtml(c.desc || 'Untitled') + '</span>' +
    '<span class="cal-item-status">' + escapeHtml(STATUS_LABELS[c.status] || c.status) + '</span>' +
    '</div>';
}

// One day's posts on a timeline. The next one to post is the big highlighted card.
function dayTimelineHtml(posts, day) {
  const label = parseDay(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const addBar = '<button type="button" class="day-add" id="dayAddBtn"><span>Add on ' + escapeHtml(label) + '</span><span class="day-add-plus" aria-hidden="true">+</span></button>';
  if (!posts.length) {
    return '<div class="day-empty">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>' +
      '<p>Nothing on this day yet.</p><p class="day-empty-sub">Drag something from the tray onto a day above, or add one.</p></div>' + addBar;
  }
  const featured = posts.find(c => c.status !== 'posted');
  const grip = '<span class="drag-handle" title="Drag onto a day" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></span>';
  return '<div class="timeline">' + posts.map(c => {
    const big = c === featured;
    const posted = c.status === 'posted';
    const p = pillarOf(c.pillar);
    return '<div class="tl-row' + (big ? ' featured' : '') + (posted ? ' done' : '') + '">' +
      '<span class="tl-node" aria-hidden="true">' + (posted ? '✓' : '') + '</span>' +
      '<div class="tl-card' + (big ? ' surface c' + p.color : '') + '" data-clip-id="' + escapeHtml(c.id) + '">' +
        '<div class="tl-top"><span class="tl-pillar">' + pillarIconSvg(p.key) + escapeHtml(p.label) + '</span>' +
          '<span class="tl-stage">' + escapeHtml(STATUS_LABELS[c.status]) + '</span></div>' +
        '<div class="tl-text">' + escapeHtml(c.desc || 'Untitled') + '</div>' +
        '<div class="tl-foot">' + (c.catTags.length ? catStackHtml(c.catTags) : '<span></span>') + (posted ? '' : grip) + '</div>' +
      '</div></div>';
  }).join('') + '</div>' + addBar;
}

// Swipe the week strip left/right for the next/previous week
function enableStripSwipe(strip, step) {
  if (!strip) return;
  let x0 = null, y0 = 0;
  strip.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  strip.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      calDragJustEnded = true; // swallow the tap on the day under the finger
      setTimeout(() => { calDragJustEnded = false; }, 80);
      step(dx < 0 ? 1 : -1);
    }
  });
  strip.addEventListener('pointercancel', () => { x0 = null; });
}

function renderCalendar() {
  const container = document.getElementById('calendarView');
  const today = localToday();
  const visible = clips.filter(c => !c.archived);
  const byDate = {};
  visible.forEach(c => { if (c.scheduledDate) (byDate[c.scheduledDate] = byDate[c.scheduledDate] || []).push(c); });
  // Tray: planned posts without a day. Bank ideas can be pulled in from the button.
  const unscheduled = visible.filter(c => !c.scheduledDate && c.status === 'planned');

  let title, body, dayTop = '';
  if (!calDay) calDay = today;
  if (calView === 'day') {
    const monday = mondayOf(calDay);
    const fmt = (d, opts) => parseDay(d).toLocaleDateString('en-US', opts);
    title = fmt(calDay, { month: 'long', year: 'numeric' });
    const rel = { [today]: 'Today', [addDays(today, 1)]: 'Tomorrow', [addDays(today, -1)]: 'Yesterday' }[calDay];
    dayTop = '<div class="day-head"><div>' +
        '<div class="day-head-date">' + escapeHtml(fmt(calDay, { month: 'long', day: 'numeric', year: 'numeric' })) + '</div>' +
        '<div class="day-head-title">' + escapeHtml(rel || fmt(calDay, { weekday: 'long' })) + '</div></div>' +
        (calDay === today ? '' : '<button type="button" class="link-btn" id="dayTodayBtn">Back to today</button>') +
      '</div><div class="day-strip" role="group" aria-label="Pick a day (swipe for other weeks)">';
    for (let i = 0; i < 7; i++) {
      const day = addDays(monday, i);
      const n = (byDate[day] || []).length;
      dayTop += '<button type="button" class="day-strip-day' + (day === calDay ? ' selected' : '') + (day === today ? ' today' : '') +
        (POSTING_DAYS.includes(i) ? ' posting' : '') + '" data-date="' + day + '" aria-pressed="' + (day === calDay) + '">' +
        '<span class="day-strip-name">' + fmt(day, { weekday: 'short' }) + '</span>' +
        '<span class="day-strip-num">' + parseDay(day).getDate() + '</span>' +
        '<span class="day-strip-dot' + (n ? ' on' : '') + '"></span></button>';
    }
    dayTop += '</div>';
    body = dayTimelineHtml(byDate[calDay] || [], calDay);
  } else if (calView === 'week') {
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
    (calView === 'day' ? '' : '<h2>' + escapeHtml(title) + '</h2>') +
    '<div class="chip-row cal-view-toggle" role="group" aria-label="Calendar view">' +
      CAL_VIEWS.map(([v, label]) => '<button type="button" class="chip' + (calView === v ? ' selected' : '') + '" aria-pressed="' + (calView === v) + '" data-cal-view="' + v + '">' + label + '</button>').join('') +
    '</div>' +
  '</div>' +
  (calView === 'day' ? '' : '<div class="nav-btns cal-nav"><button id="calPrev" aria-label="Previous">‹</button><button id="calToday">Today</button><button id="calNext" aria-label="Next">›</button></div>');
  html += dayTop;
  const trayIdeas = calTrayIdeas ? bankIdeas().slice(0, 12) : [];
  const trayItems = unscheduled.concat(trayIdeas);
  html += '<div class="cal-tray"><div class="cal-tray-head"><span class="cal-tray-label">' +
    (trayItems.length ? 'No day yet · drag onto a day' : 'Everything planned has a day') + '</span>' +
    '<button type="button" class="link-btn" id="calTrayIdeasBtn">' + (calTrayIdeas ? 'Hide bank' : '+ From the bank') + '</button></div>' +
    (trayItems.length ? '<div class="cal-tray-items">' + trayItems.map(c => calItemHtml(c)).join('') + '</div>' : '') + '</div>';
  container.innerHTML = html + body;
  container.classList.toggle('cal-mode-week', calView === 'week' || calView === 'day');
  container.classList.toggle('cal-mode-day', calView === 'day');

  // Day view: swiping the strip moves a week, keeping the weekday
  const step = (dir) => {
    if (calView === 'day') calDay = addDays(calDay, dir * 7);
    else if (calView === 'week') calWeekOffset += dir;
    else calMonthOffset += dir;
    renderCalendar();
  };
  if (calView === 'day') {
    const back = document.getElementById('dayTodayBtn');
    if (back) back.onclick = () => { calDay = today; renderCalendar(); };
    enableStripSwipe(container.querySelector('.day-strip'), step);
  } else {
    document.getElementById('calPrev').onclick = () => step(-1);
    document.getElementById('calNext').onclick = () => step(1);
    document.getElementById('calToday').onclick = () => { calWeekOffset = 0; calMonthOffset = 0; calDay = today; renderCalendar(); };
  }
  document.getElementById('calTrayIdeasBtn').onclick = () => { calTrayIdeas = !calTrayIdeas; renderCalendar(); };
  container.querySelectorAll('[data-cal-view]').forEach(b => b.onclick = () => {
    calView = b.dataset.calView;
    try { localStorage.setItem('tsc-cal-view-v2', calView); } catch (e) {}
    renderCalendar();
  });

  container.querySelectorAll('.cal-post, .cal-item, .tl-card').forEach(el => {
    makePressable(el, el.querySelector('.cal-item-text') ? el.querySelector('.cal-item-text').textContent : el.textContent);
    el.onclick = (e) => { e.stopPropagation(); if (!calDragJustEnded) openCardModal(el.dataset.clipId); };
  });
  container.querySelectorAll('[data-date]').forEach(cell => {
    cell.title = 'Plan a post for ' + formatDateLong(cell.dataset.date);
    cell.onclick = () => {
      if (calDragJustEnded) return;
      openEntrySheet({ date: cell.dataset.date });
    };
  });
  // In day view, tapping a day in the strip opens that day (it's still a drop target for dragging)
  container.querySelectorAll('.day-strip-day').forEach(b => {
    b.title = formatDateLong(b.dataset.date);
    b.onclick = () => { if (!calDragJustEnded) { calDay = b.dataset.date; renderCalendar(); } };
  });
  const addOn = document.getElementById('dayAddBtn');
  if (addOn) addOn.onclick = () => openEntrySheet({ date: calDay });
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
