/* Aulap Cyber History — no API keys, dependencies, notifications or threat scanning. */
function initCyberHistory() {
  'use strict';
  const records = Array.isArray(window.AulapCyberHistory) ? window.AulapCyberHistory : [];
  const $ = id => document.getElementById(id);
  const virusTray = $('virus-tray');
  const virusPanel = $('virus-panel');
  const clock = $('clock');
  const calendarPanel = $('calendar-panel');
  if (!virusTray || !virusPanel || !clock || !calendarPanel || !records.length) return;

  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const history = records.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && /^https:\/\//.test(x.url)).sort((a,b) => a.date.localeCompare(b.date));
  const profiles = history.filter(x => /worm|virus|ransomware|botnet|malware|wiper/i.test(x.kind));
  const onDate = new Map();
  history.forEach(item => {
    const key = item.date.slice(5);
    if (!onDate.has(key)) onDate.set(key, []);
    onDate.get(key).push(item);
  });
  const entryKey = d => `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const localDate = (year, month, day) => new Date(year,month,day,12,0,0,0);
  const todayLocal = () => { const n = new Date(); return localDate(n.getFullYear(),n.getMonth(),n.getDate()); };
  const dayNumber = date => Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()) / 86400000);
  const fullDate = date => new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(date);
  const formatDayMonth = date => new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long'}).format(date);
  const formatItemDate = item => {
    const [y,m,d] = item.date.split('-').map(Number);
    return fullDate(localDate(y,m-1,d));
  };
  const put = (id, value) => { const node = $(id); if(node) node.textContent = value; };
  const source = $('museum-source');
  const museumNav = $('museum-to-calendar');
  const museumNext = $('museum-next');
  const museumReset = $('museum-reset');
  let localDay = '';
  let museumBase = 0;
  let museumOffset = 0;
  let featured = null;

  function renderProfile() {
    if (!profiles.length) return;
    featured = profiles[(museumBase + museumOffset) % profiles.length];
    const year = featured.date.slice(0,4);
    const icon = /worm/i.test(featured.kind) ? '✣' : /botnet/i.test(featured.kind) ? '⌘' : /ransomware|wiper/i.test(featured.kind) ? '☣' : '◆';
    put('museum-avatar',icon);
    put('museum-kind',featured.kind.toUpperCase());
    put('museum-title',featured.name);
    put('museum-year',`${featured.event} · ${formatItemDate(featured)}`);
    put('museum-summary',featured.summary);
    put('museum-current-date',formatDayMonth(todayLocal()));
    source.textContent = `Sumber: ${featured.source} ↗`; 
    source.href = featured.url;
    const isRansom = /ransomware|wiper/i.test(featured.kind);
    virusTray.dataset.archiveStyle = isRansom ? 'red' : /worm/i.test(featured.kind) ? 'amber' : 'blue';
    const symbol = virusTray.querySelector('.virus-icon');
    if (symbol) symbol.textContent = icon;
    virusTray.title = `Threat of the Day: ${featured.name} (${year})`; 
    virusTray.setAttribute('aria-label',`Threat of the Day: ${featured.name} (${year})`); 
    museumReset.disabled = museumOffset === 0;
  }
  function syncDaily() {
    const now = todayLocal();
    const key = `${now.getFullYear()}-${entryKey(now)}`;
    if (key === localDay) return;
    localDay = key;
    // Daily index always advances by one, including across month/year boundaries.
    museumBase = dayNumber(now) % profiles.length;
    museumOffset = 0;
    renderProfile();
    if (!calendarPanel.hidden && selectedDate && entryKey(selectedDate) === entryKey(now)) {
      renderCalendar();
    }
  }
  museumNext?.addEventListener('click', () => { museumOffset = (museumOffset + 1) % profiles.length; renderProfile(); });
  museumReset?.addEventListener('click', () => { museumOffset = 0; renderProfile(); });
  virusTray.addEventListener('click', () => { syncDaily(); });

  const grid = $('calendar-grid');
  const historyDetail = $('calendar-history');
  const monthLabel = $('calendar-month');
  const previous = $('calendar-prev');
  const next = $('calendar-next');
  const today = $('calendar-today');
  let selectedDate = todayLocal();
  let viewYear = selectedDate.getFullYear();
  let viewMonth = selectedDate.getMonth();

  function make(tag, text, className) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function selectDate(date) {
    selectedDate = localDate(date.getFullYear(),date.getMonth(),date.getDate());
    viewYear = selectedDate.getFullYear();
    viewMonth = selectedDate.getMonth();
    renderCalendar();
  }
  function renderEvents() {
    historyDetail.replaceChildren();
    const header = make('div',null,'history-headline');
    header.append(make('span',`EVENT PADA ${formatDayMonth(selectedDate).toUpperCase()}`));
    const entries = onDate.get(entryKey(selectedDate)) || [];
    historyDetail.append(header);
    if (!entries.length) {
      historyDetail.append(make('p','Tidak ada event pada tanggal ini.','history-empty'));
      return;
    }
    entries.forEach(item => {
      const article = make('article',null,'history-entry');
      const meta = make('span',`${item.date.slice(0,4)}  /  ${item.event.toUpperCase()}`,'history-meta');
      const title = make('h3',item.name);
      const summary = make('p',item.summary);
      const link = make('a',`Sumber: ${item.source} ↗`,'history-source');
      link.href = item.url; link.target='_blank'; link.rel='noopener noreferrer';
      article.append(meta,title,summary,link);
      historyDetail.append(article);
    });
  }
  function renderCalendar() {
    if (!grid) return;
    monthLabel.textContent = `${months[viewMonth]} ${viewYear}`;
    grid.replaceChildren();
    const count = new Date(viewYear,viewMonth+1,0).getDate();
    const offset = (new Date(viewYear,viewMonth,1).getDay()+6)%7;
    const n = todayLocal();
    for (let i=0; i<offset; i++) grid.append(make('span','', 'calendar-blank'));
    for (let day=1;day<=count;day++) {
      const date = localDate(viewYear,viewMonth,day);
      const key = entryKey(date);
      const events = onDate.get(key) || [];
      const b = make('button',null,'calendar-day');
      b.type='button'; b.dataset.day=String(day);
      if (date.getTime()===selectedDate.getTime()) { b.classList.add('is-selected'); b.setAttribute('aria-pressed','true'); }
      else b.setAttribute('aria-pressed','false');
      if (date.getTime()===n.getTime()) b.classList.add('is-today');
      if (events.length) b.classList.add('has-events');
      b.setAttribute('aria-label',`${fullDate(date)}${events.length ? `, ${events.length} peristiwa sejarah` : ', belum ada arsip'}`);
      b.append(make('span',String(day)));
      if (events.length) b.append(make('span','', 'day-dot'));
      grid.append(b);
    }
    renderEvents();
  }
  grid?.addEventListener('click', event => {
    const button = event.target.closest('button[data-day]');
    if (button) selectDate(localDate(viewYear,viewMonth,Number(button.dataset.day)));
  });
  function changeMonth(delta) {
    const month = new Date(viewYear,viewMonth+delta,1);
    viewYear = month.getFullYear(); viewMonth = month.getMonth();
    selectedDate = localDate(viewYear,viewMonth,Math.min(selectedDate.getDate(), new Date(viewYear,viewMonth+1,0).getDate()));
    renderCalendar();
  }
  previous?.addEventListener('click', () => changeMonth(-1));
  next?.addEventListener('click', () => changeMonth(1));
  today?.addEventListener('click', () => selectDate(todayLocal()));
  clock.addEventListener('click', renderCalendar);
  museumNav?.addEventListener('click', () => {
    if (!featured) return;
    const [year,month,day] = featured.date.split('-').map(Number);
    // Show the matching month/day this year, then cite the historical year in the event card.
    selectDate(localDate(todayLocal().getFullYear(),month-1,day));
    virusPanel.hidden = true;
    virusTray.setAttribute('aria-expanded','false');
    calendarPanel.hidden = false;
    clock.setAttribute('aria-expanded','true');
    today?.focus({preventScroll:true});
  });
  syncDaily();
  renderCalendar();
  window.setInterval(syncDaily, 30000);}
if (window.aulapIncludesReady) {
  window.aulapIncludesReady.then(initCyberHistory);
} else {
  initCyberHistory();
}
