// Small shared helpers: escaping, dates, copy to clipboard, toasts with Undo, accessibility helpers.

function pickRandom(list, avoid) {
  const options = list.filter(x => !avoid.includes(x));
  const pool = options.length ? options : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

function copyText(text, el) {
  const showCopied = () => {
    const orig = el.textContent;
    el.textContent = 'Copied ✓';
    el.classList.add('just-copied');
    setTimeout(() => { el.textContent = orig; el.classList.remove('just-copied'); }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showCopied).catch(() => fallbackCopy(text, showCopied));
  } else {
    fallbackCopy(text, showCopied);
  }
}

// Same as copyText, but swaps a checkmark in over an icon button without wiping its SVG
function copyWithIconFeedback(text, btn) {
  const origHTML = btn.innerHTML;
  const finish = () => {
    btn.innerHTML = '✓';
    btn.classList.add('just-copied');
    setTimeout(() => { btn.innerHTML = origHTML; btn.classList.remove('just-copied'); }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
  } else {
    fallbackCopy(text, finish);
  }
}

function fallbackCopy(text, onSuccess) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    onSuccess();
  } catch (e) {
    console.error('Copy failed', e);
  }
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return days + ' days ago';
}

function formatDateLong(dateStr) {
  const [y,m,d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m-1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ===== Accessible names for icon-only buttons =====
// Most icon buttons only carry a title, which phones never show and screen readers may skip.
function labelIconButtons(root) {
  root.querySelectorAll('button[title]:not([aria-label])').forEach(btn => {
    if (!btn.textContent.trim()) btn.setAttribute('aria-label', btn.title);
  });
}

new MutationObserver(() => labelIconButtons(document.body)).observe(document.body, { childList: true, subtree: true });

// ===== Toast =====
let toastTimer = null;

let toastUndo = null;

function showToast(message, opts) {
  const o = opts || {};
  const el = document.getElementById('toast');
  const action = document.getElementById('toastAction');
  document.getElementById('toastText').textContent = message;
  toastUndo = o.onUndo || null;
  action.textContent = toastUndo ? 'Undo' : '';
  el.classList.toggle('error', !!o.error);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, o.duration || (toastUndo ? 6000 : 2500));
}

function hideToast() {
  clearTimeout(toastTimer);
  toastUndo = null;
  document.getElementById('toast').classList.remove('show');
}

document.getElementById('toastAction').addEventListener('click', () => {
  const undo = toastUndo;
  hideToast();
  if (undo) undo();
});

// Remove items from a list, with an Undo that puts them back where they were.
function removeWithUndo(list, ids, label, save, rerender) {
  const removed = [];
  list.forEach((item, i) => { if (ids.includes(item.id)) removed.push({ item, i }); });
  for (let k = removed.length - 1; k >= 0; k--) list.splice(removed[k].i, 1);
  save();
  rerender();
  showToast(label, {
    onUndo: () => {
      removed.forEach(({ item, i }) => list.splice(Math.min(i, list.length), 0, item));
      save();
      rerender();
    }
  });
}

// Safe for both text and attribute values (quotes included)
function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / 86400000);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobile() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function playViewAnim(el) {
  if (!el) return;
  el.classList.remove('view-anim');
  void el.offsetWidth; // force reflow so the animation restarts
  el.classList.add('view-anim');
}

// Clickable non-button elements: focusable, announced as buttons, Enter/Space activates
function makePressable(el, label) {
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  if (label) el.setAttribute('aria-label', label.length > 120 ? label.slice(0, 117) + '…' : label);
  el.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); el.click(); }
  });
}

// YYYY-MM-DD in local time, `offset` days from today
function localDay(offset) {
  const n = new Date();
  n.setDate(n.getDate() + (offset || 0));
  return [n.getFullYear(), String(n.getMonth() + 1).padStart(2, '0'), String(n.getDate()).padStart(2, '0')].join('-');
}

function localToday() {
  return localDay(0);
}

// ===== Dates: YYYY-MM-DD strings in local time =====
function parseDay(str) { const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); }

function dayKey(date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'); }

function addDays(str, n) { const d = parseDay(str); d.setDate(d.getDate() + n); return dayKey(d); }

function mondayOf(str) { const d = parseDay(str); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dayKey(d); }

function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 86400000); }
