// Phone reminders through Capacitor Local Notifications (Android app only).

// ===== Phone reminders (Android app only) =====
// "Post due today" on each planned post's date, and "Follow up with <brand>" two weeks after
// contacting a brand that's still waiting. Everything is rescheduled from the data after saves,
// so editing, deleting or posting a card updates its reminder.
const FOLLOW_UP_AFTER_DAYS = 14;

const MAX_REMINDERS = 50;

function notifPlugin() {
  const cap = window.Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
  return (cap.Plugins && cap.Plugins.LocalNotifications) || null;
}

// Stable positive 31-bit id per reminder, so rescheduling replaces instead of duplicating
function notifId(key) {
  let h = 7;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(h) % 2147483646) + 1;
}

function reminderAt(day, time) {
  const [hh, mm] = time.split(':').map(Number);
  const d = parseDay(day);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// Next reminder-time slot from now: later today if it hasn't passed, else tomorrow
function nextReminderSlot(now) {
  const today = reminderAt(localToday(), settings.reminderTime);
  return today > now ? today : reminderAt(localDay(1), settings.reminderTime);
}

function plannedReminders(now) {
  const out = [];
  clips.forEach(c => {
    if (c.archived || c.status === 'posted' || !c.scheduledDate) return;
    const at = reminderAt(c.scheduledDate, settings.reminderTime);
    if (at <= now) return;
    out.push({
      id: notifId('post:' + c.id), title: 'Post due today',
      body: c.desc ? c.desc.slice(0, 140) : 'A planned post is due today.',
      at, extra: { clipId: c.id }
    });
  });
  brands.forEach(b => {
    if (isPinnedBrand(b) || b.status !== 'waiting') return;
    const contacted = b.date || (b.updatedAt ? dayKey(new Date(b.updatedAt)) : '');
    if (!contacted) return;
    const due = addDays(contacted, FOLLOW_UP_AFTER_DAYS);
    let at = reminderAt(due, settings.reminderTime);
    if (at <= now) {
      // Already overdue: remind once at the next slot, and keep that slot on later reschedules
      const prev = settings.remindedFollowUps[b.id];
      if (prev && prev.due === due) {
        at = new Date(prev.at);
        if (at <= now) return;
      } else {
        at = nextReminderSlot(now);
        settings.remindedFollowUps[b.id] = { due, at: at.toISOString() };
      }
    }
    out.push({
      id: notifId('brand:' + b.id), title: 'Follow up with ' + b.name,
      body: "It's been two weeks since you reached out. The follow-up template is ready in Templates.",
      at, extra: { brandId: b.id }
    });
  });
  return out.sort((a, b) => a.at - b.at).slice(0, MAX_REMINDERS);
}

let reminderSyncTimer = null;

function scheduleReminderSync() {
  clearTimeout(reminderSyncTimer);
  reminderSyncTimer = setTimeout(syncReminders, 600);
}

async function syncReminders() {
  const plugin = notifPlugin();
  if (!plugin) return;
  try {
    const before = JSON.stringify(settings.remindedFollowUps);
    const wanted = settings.remindersOn ? plannedReminders(new Date()) : [];
    const pending = ((await plugin.getPending()) || {}).notifications || [];
    const keep = new Set(wanted.map(n => n.id));
    const stale = pending.filter(n => !keep.has(n.id)).map(n => ({ id: n.id }));
    if (stale.length) await plugin.cancel({ notifications: stale });
    if (wanted.length) {
      await plugin.schedule({
        notifications: wanted.map(n => ({
          id: n.id, title: n.title, body: n.body, extra: n.extra,
          schedule: { at: n.at, allowWhileIdle: true },
          smallIcon: 'ic_stat_notify', iconColor: '#0059FF'
        }))
      });
    }
    if (JSON.stringify(settings.remindedFollowUps) !== before) persist();
  } catch (e) {
    console.error('Reminder sync failed', e);
  }
}

async function setRemindersOn(on) {
  const plugin = notifPlugin();
  if (on && plugin) {
    let perm = await plugin.checkPermissions();
    if (perm.display !== 'granted') perm = await plugin.requestPermissions();
    if (perm.display !== 'granted') {
      showToast('Notifications are off for this app. Turn them on in Android settings.', { error: true, duration: 6000 });
      on = false;
    }
  }
  settings.remindersOn = on;
  persist();
  renderReminderSettings();
  scheduleReminderSync();
  if (on) showToast('Reminders on at ' + formatReminderTime(settings.reminderTime));
}

function formatReminderTime(t) {
  const [h, m] = t.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function renderReminderSettings() {
  const row = document.getElementById('settingsReminderRow');
  const hint = document.getElementById('settingsReminderHint');
  if (!row) return;
  row.innerHTML = '';
  if (!notifPlugin()) {
    hint.textContent = 'Reminders for posts due today and brand follow-ups work in the Android app.';
    return;
  }
  [['On', true], ['Off', false]].forEach(([label, val]) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (settings.remindersOn === val ? ' selected' : '');
    chip.setAttribute('aria-pressed', settings.remindersOn === val ? 'true' : 'false');
    chip.textContent = label;
    chip.onclick = () => setRemindersOn(val);
    row.appendChild(chip);
  });
  if (settings.remindersOn) {
    const time = document.createElement('input');
    time.type = 'time';
    time.className = 'reminder-time';
    time.value = settings.reminderTime;
    time.setAttribute('aria-label', 'Reminder time');
    time.onchange = () => {
      if (!/^\d{2}:\d{2}$/.test(time.value)) return;
      settings.reminderTime = time.value;
      settings.remindedFollowUps = {};
      persist();
      scheduleReminderSync();
    };
    row.appendChild(time);
  }
  hint.textContent = settings.remindersOn
    ? 'A nudge on the morning a post is due, and when a brand has waited two weeks for a follow-up.'
    : 'Get a nudge when a post is due and when a brand needs a follow-up.';
}

// Tapping a reminder opens the card, or the follow-up pitch for that brand
(function listenForReminderTaps() {
  const plugin = notifPlugin();
  if (!plugin) return;
  plugin.addListener('localNotificationActionPerformed', (ev) => {
    const extra = (ev && ev.notification && ev.notification.extra) || {};
    if (extra.clipId && clips.some(c => c.id === extra.clipId)) {
      openCardModal(extra.clipId);
    } else if (extra.brandId && brands.some(b => b.id === extra.brandId)) {
      goToFollowUpPitch(extra.brandId);
    }
  });
})();
