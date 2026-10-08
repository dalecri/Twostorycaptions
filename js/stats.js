// Home stats card: weekly goal, streak, per-cat counts (tap one for their posts) and the neglected-cat nudge.

function computeStats() {
  const today = localToday();
  const goal = settings.weeklyGoal;
  const posted = clips.filter(c => c.status === 'posted' && c.scheduledDate && c.scheduledDate <= today);
  const perWeek = {};
  posted.forEach(c => { const w = mondayOf(c.scheduledDate); perWeek[w] = (perWeek[w] || 0) + 1; });

  const monday = mondayOf(today);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i);
    week.push({
      day,
      letter: 'MTWTFSS'[i],
      posted: posted.some(c => c.scheduledDate === day),
      planned: clips.some(c => !c.archived && c.status !== 'posted' && c.scheduledDate === day),
      today: day === today
    });
  }
  const thisWeek = perWeek[monday] || 0;

  // Weeks in a row that hit the goal. This week only counts once it's hit, so the streak
  // isn't "broken" on a Monday morning.
  let streak = thisWeek >= goal ? 1 : 0;
  for (let w = addDays(monday, -7); (perWeek[w] || 0) >= goal; w = addDays(w, -7)) streak++;

  // Counts include posts logged without a date (e.g. imported history); "days since" needs dates
  const allPosted = clips.filter(c => c.status === 'posted');
  const cats = CATS.map(cat => {
    const count = allPosted.filter(c => (c.catTags || []).includes(cat)).length;
    const last = posted.filter(c => (c.catTags || []).includes(cat))
      .reduce((max, c) => (c.scheduledDate > max ? c.scheduledDate : max), '');
    return { cat, count, since: last ? daysBetween(last, today) : count ? null : Infinity };
  });
  // A cat whose posts are all undated has an unknown gap, so it isn't nudged
  const known = cats.filter(c => c.since !== null);
  const neglected = known.length ? known.reduce((a, b) => (b.since > a.since ? b : a)) : { since: 0 };
  return { goal, thisWeek, week, streak, cats, neglected };
}

function renderHomeStats() {
  const el = document.getElementById('homeStats');
  const st = computeStats();
  const left = Math.max(0, st.goal - st.thisWeek);
  const goalLine = left === 0 ? 'Goal hit. Nice work!' : left + ' more to hit your goal';
  const streakLine = st.streak > 0 ? st.streak + '-week streak' : 'No streak yet';
  const n = st.neglected;
  let nudge = '';
  if (n.since === Infinity) nudge = n.cat + " hasn't starred in a post yet";
  else if (n.since >= 7) nudge = n.cat + ' has been neglected for ' + n.since + ' days';

  el.innerHTML = `
    <div class="hs-top">
      <div>
        <div class="card-kicker">This week</div>
        <div class="hs-count"><strong>${st.thisWeek}</strong> / ${st.goal} posts</div>
        <div class="hs-sub">${escapeHtml(goalLine)}</div>
      </div>
      <div class="hs-streak${st.streak ? ' on' : ''}">
        <div class="hs-streak-num">${st.streak}</div>
        <div class="hs-sub">${escapeHtml(streakLine)}</div>
      </div>
    </div>
    <div class="hs-week" aria-label="Posts by day">
      ${st.week.map(d => `<div class="hs-day${d.today ? ' today' : ''}" title="${escapeHtml(formatDateLong(d.day))}${d.posted ? ': posted' : d.planned ? ': planned' : ''}">
        <span class="hs-dot${d.posted ? ' posted' : d.planned ? ' planned' : ''}"></span><span class="hs-letter">${d.letter}</span></div>`).join('')}
    </div>
    <div class="hs-cats">
      ${st.cats.map(c => `<button type="button" class="hs-cat" data-cat="${escapeHtml(c.cat)}" title="See ${escapeHtml(c.cat)}'s ${c.count} post${c.count === 1 ? '' : 's'}"><span class="cat-dot" style="--cat-color:${CAT_PROFILES[c.cat].bg}"></span>${escapeHtml(c.cat)} <strong>${c.count}</strong></button>`).join('')}
    </div>
    ${nudge ? `<button type="button" class="hs-nudge" data-cat="${escapeHtml(n.cat)}"><span>${escapeHtml(nudge)}</span><span class="hs-nudge-cta">Plan one ›</span></button>` : ''}
  `;
  const btn = el.querySelector('.hs-nudge');
  if (btn) btn.onclick = () => openEntrySheet({ cats: [btn.dataset.cat] });
  // A cat's count opens the library showing just their posts
  el.querySelectorAll('.hs-cat').forEach(b => b.addEventListener('click', () => {
    libraryCat = b.dataset.cat;
    libraryPillar = '';
    libraryArchived = false;
    libraryShown = LIBRARY_PAGE;
    goTo('library');
  }));
}
