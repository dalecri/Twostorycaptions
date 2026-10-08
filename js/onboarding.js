// First-launch intro cards.

// ===== Onboarding: a few swipeable cards on first launch, replayable from Settings =====
const ONBOARDED_KEY = 'tsc-onboarded';

const BIG_ICON = svg => svg.replace('<svg ', '<svg class="ob-icon" ');

const ONBOARDING_SLIDES = [
  { color: 'c3', kicker: 'Welcome', title: 'Two floors, four cats, one plan',
    text: 'Your home for every TwoStoryTails caption: the ones you\'ve posted, the ones you\'re saving, and what\'s going up next. It all stays on this phone.',
    art: () => '<div class="ob-cats">' + CATS.map(c => '<span class="cat-avatar">' + catAvatarSvg(c) + '</span>').join('') + '</div>' },
  { color: 'c6', kicker: 'Bank', title: 'Save every idea',
    text: 'Tap + when a line pops into your head. It lands in the Bank, sorted into one of seven pillars like Food & treats or Sibling chaos.',
    art: () => BIG_ICON(VIEW_META.bank.icon) },
  { color: 'c1', kicker: 'Plan', title: 'Give it a day',
    text: 'Open an idea and pick a date, or drag it onto a day in Plan. Home shows the next few and how your week is going.',
    art: () => BIG_ICON(NAV_ICONS.calendar) },
  { color: 'c0', kicker: 'Library', title: 'Your posted grid',
    text: 'Posted captions live in the Library, like your profile grid. Tap a cat or a pillar to see just those.',
    art: () => BIG_ICON(VIEW_META.library.icon) },
  { color: 'c2', kicker: 'Good to know', title: 'Stuck for a line?',
    text: 'Every card has an AI prompt in our voice, and brand outreach lives behind the card at the bottom of Home. Export a backup from Settings now and then.',
    art: () => BIG_ICON(NAV_ICONS.paw) }
];

let obIndex = 0;

function renderOnboarding(direction) {
  const slide = ONBOARDING_SLIDES[obIndex];
  const card = document.getElementById('obCard');
  card.className = 'ob-card surface ' + slide.color;
  document.getElementById('obArt').innerHTML = slide.art();
  document.getElementById('obKicker').textContent = slide.kicker;
  document.getElementById('obTitle').textContent = slide.title;
  document.getElementById('obText').textContent = slide.text;
  const last = obIndex === ONBOARDING_SLIDES.length - 1;
  document.getElementById('obNext').textContent = last ? "Let's go" : 'Next';
  document.getElementById('obSkip').style.visibility = last ? 'hidden' : 'visible';
  document.getElementById('obDots').innerHTML = ONBOARDING_SLIDES
    .map((_, i) => '<span class="ob-dot' + (i === obIndex ? ' on' : '') + '"></span>').join('');
  if (direction && !prefersReducedMotion()) {
    card.animate(
      [{ opacity: 0, transform: 'translateX(' + (direction * 24) + 'px)' }, { opacity: 1, transform: 'none' }],
      { duration: 220, easing: 'cubic-bezier(.2,.9,.25,1)' }
    );
  }
}

function showOnboarding() {
  obIndex = 0;
  const el = document.getElementById('onboarding');
  el.hidden = false;
  document.documentElement.classList.add('focus-open');
  renderOnboarding();
  document.getElementById('obNext').focus({ focusVisible: false });
}

function finishOnboarding() {
  document.getElementById('onboarding').hidden = true;
  document.documentElement.classList.remove('focus-open');
  try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch (e) {}
}

function stepOnboarding(delta) {
  const next = obIndex + delta;
  if (next >= ONBOARDING_SLIDES.length) { finishOnboarding(); return; }
  if (next < 0) return;
  obIndex = next;
  renderOnboarding(delta);
}

function maybeShowOnboarding() {
  let seen = false;
  try { seen = localStorage.getItem(ONBOARDED_KEY) === '1'; } catch (e) {}
  if (!seen) showOnboarding();
}

document.getElementById('obNext').addEventListener('click', () => stepOnboarding(1));

document.getElementById('obSkip').addEventListener('click', finishOnboarding);

document.getElementById('onboarding').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') finishOnboarding();
  else if (e.key === 'ArrowRight') stepOnboarding(1);
  else if (e.key === 'ArrowLeft') stepOnboarding(-1);
});

(function enableSwipe() {
  const card = document.getElementById('obCard');
  let startX = null;
  card.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  card.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) stepOnboarding(dx < 0 ? 1 : -1);
  });
})();

document.getElementById('replayIntroBtn').addEventListener('click', () => { closeSettingsModal(); showOnboarding(); });
