/* Aulap Software Classic Dark — retro desktop interactions without dependencies. */
function initSite() {
  'use strict';
  // Add your published Google Forms embed URL to enable the contact form iframe.
  const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeZ1LosfzOs3a1eejzMewDE5a1QXg9lWX3bZMucCm8LJ_Mgng/viewform?embedded=true';
  const $ = (selector) => document.querySelector(selector);
  const start = $('#start-button');
  const startMenu = $('#start-menu');
  const navButton = $('#mobile-toggle');
  const nav = $('#primary-nav');
  const windowEl = $('#app-window');
  const desktop = $('#desktop-workspace');
  const taskButton = $('#window-task-button');
  const minimizeButton = $('#window-minimize');
  const maximizeButton = $('#window-maximize');
  const closeButton = $('#window-close');
  const titlebar = windowEl?.querySelector('.titlebar');
  const virusButton = $('#virus-tray');
  const virusPanel = $('#virus-panel');
  const clock = $('#clock');
  const calendarPanel = $('#calendar-panel');
  const dateLong = $('#long-date');
  const timeLong = $('#long-time');
  const trayPairs = [[virusButton, virusPanel], [clock, calendarPanel]];

  function closeMenus() {
    if (startMenu) startMenu.hidden = true;
    start?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    navButton?.setAttribute('aria-expanded', 'false');
  }
  function closeTray() {
    trayPairs.forEach(([button, panel]) => {
      if (panel) panel.hidden = true;
      button?.setAttribute('aria-expanded', 'false');
    });
  }
  function toggleTray(button, panel) {
    if (!button || !panel) return;
    const show = panel.hidden;
    closeMenus();
    closeTray();
    panel.hidden = !show;
    button.setAttribute('aria-expanded', String(show));
  }
  start?.addEventListener('click', (event) => {
    event.stopPropagation();
    const show = !!startMenu?.hidden;
    closeTray();
    closeMenus();
    if (startMenu) startMenu.hidden = !show;
    start.setAttribute('aria-expanded', String(show));
  });
  navButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const show = !nav?.classList.contains('is-open');
    closeTray();
    closeMenus();
    nav?.classList.toggle('is-open', show);
    navButton.setAttribute('aria-expanded', String(show));
  });
  trayPairs.forEach(([button, panel]) => button?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleTray(button, panel);
  }));
  document.querySelectorAll('[data-close-panels]').forEach(button => button.addEventListener('click', closeTray));
  document.addEventListener('pointerdown', (event) => {
    if (startMenu && start && !startMenu.contains(event.target) && !start.contains(event.target)) {
      startMenu.hidden = true; start.setAttribute('aria-expanded', 'false');
    }
    if (nav && navButton && !nav.contains(event.target) && !navButton.contains(event.target)) {
      nav.classList.remove('is-open'); navButton.setAttribute('aria-expanded', 'false');
    }
    if (!event.target.closest('.tray-area')) closeTray();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeMenus(); closeTray(); }
    // A retro desktop shortcut that works while focus is in the page, not text fields.
    if (event.altKey && event.key.toLowerCase() === 'm' && !event.repeat &&
        !event.target.closest('input, textarea, select')) {
      event.preventDefault();
      if (windowEl) setWindowState(windowEl.hidden ? 'open' : 'minimized');
    }
  });

  function updateClock() {
    const now = new Date();
    if (clock) clock.textContent = new Intl.DateTimeFormat('id-ID', {hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
    if (dateLong) dateLong.textContent = new Intl.DateTimeFormat('id-ID', {weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
    if (timeLong) timeLong.textContent = new Intl.DateTimeFormat('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  }
  updateClock();
  if (clock) window.setInterval(updateClock, 30000);

  // Each webpage acts as a single Windows 95 program window.
  let windowState = 'open';
  let maximized = false;
  let dragX = 0;
  let dragY = 0;
  function updateMaximized(next) {
    if (!windowEl) return;
    maximized = next;
    document.body.classList.toggle('window-maximized', next);
    windowEl.classList.toggle('is-maximized', next);
    maximizeButton?.setAttribute('aria-pressed', String(next));
    if (maximizeButton) {
      maximizeButton.textContent = next ? '❐' : '□';
      maximizeButton.title = next ? 'Restore ukuran jendela' : 'Maximize';
      maximizeButton.setAttribute('aria-label', next ? 'Kembalikan ukuran jendela' : 'Maksimalkan jendela');
    }
    // Restore titlebar drag offsets when maximized.
    if (next) { dragX = 0; dragY = 0; windowEl.style.transform = ''; }
  }
  function setWindowState(state) {
    if (!windowEl) return;
    windowState = state;
    const visible = state === 'open';
    windowEl.hidden = !visible;
    if (desktop) desktop.hidden = visible;
    if (taskButton) {
      taskButton.dataset.windowState = visible ? 'open' : state;
      taskButton.setAttribute('aria-pressed', String(visible));
      taskButton.title = visible ? 'Minimize jendela' : 'Buka kembali jendela Aulap Software';
      taskButton.setAttribute('aria-label', visible ? 'Minimize jendela Aulap Software' : 'Restore jendela Aulap Software');
      taskButton.innerHTML = visible ? '▣ &nbsp; Aulap Software' : '▣ &nbsp; Aulap Software · buka';
    }
    if (!visible) {
      closeMenus(); closeTray();
      updateMaximized(false);
      dragX = 0; dragY = 0; windowEl.style.transform = '';
      taskButton?.focus({preventScroll:true});
    } else {
      window.scrollTo({top:0,behavior:'instant'});
      minimizeButton?.focus({preventScroll:true});
    }
  }
  minimizeButton?.addEventListener('click', () => setWindowState('minimized'));
  closeButton?.addEventListener('click', () => setWindowState('closed'));
  maximizeButton?.addEventListener('click', () => updateMaximized(!maximized));
  taskButton?.addEventListener('click', () => setWindowState(windowState === 'open' ? 'minimized' : 'open'));
  document.querySelectorAll('[data-restore-window]').forEach(button => button.addEventListener('click', () => setWindowState('open')));
  titlebar?.addEventListener('dblclick', (event) => {
    if (event.target.closest('button')) return;
    updateMaximized(!maximized);
  });

  // Drag by the titlebar on desktop; never intercept touch scrolling or mobile navigation.
  let dragging = false;
  let startX = 0, startY = 0;
  let baseX = 0, baseY = 0;
  let initialRect = null;
  titlebar?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.pointerType === 'touch' ||
        !window.matchMedia('(min-width: 768px) and (pointer: fine)').matches ||
        maximized || event.target.closest('button,a')) return;
    dragging = true;
    startX = event.clientX; startY = event.clientY;
    baseX = dragX; baseY = dragY;
    initialRect = windowEl.getBoundingClientRect();
    titlebar.classList.add('dragging');
    titlebar.setPointerCapture(event.pointerId);
  });
  titlebar?.addEventListener('pointermove', (event) => {
    if (!dragging || !initialRect) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    // Keep a substantial portion of the titlebar on screen.
    const x = Math.max(10 - initialRect.left, Math.min(window.innerWidth - 10 - initialRect.right, dx));
    const y = Math.max(8 - initialRect.top, Math.min(window.innerHeight - 76 - initialRect.top, dy));
    dragX = baseX + x; dragY = baseY + y;
    windowEl.style.transform = `translate(${dragX}px,${dragY}px)`;
  });
  function endDrag() { dragging = false; initialRect = null; titlebar?.classList.remove('dragging'); }
  titlebar?.addEventListener('pointerup', endDrag);
  titlebar?.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && windowEl) { dragX = 0; dragY = 0; windowEl.style.transform = ''; }
  });

  // Contact form gracefully works even without a server or Google Forms embed.
  const slot = $('[data-google-form-slot]');
  const contactForm = $('#contact-form');
  if (slot && /^https:\/\/docs\.google\.com\/forms\//.test(GOOGLE_FORM_EMBED_URL)) {
    const iframe = document.createElement('iframe');
    iframe.src = GOOGLE_FORM_EMBED_URL;
    iframe.title = 'Formulir Kontak Aulap Software';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.cssText = 'width:100%;min-height:830px;border:0;background:#fff';
    slot.append(iframe); slot.hidden = false;
    if (contactForm) contactForm.hidden = true;
  }
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const subject = 'Aulap Software — ' + String(data.get('subject'));
    const body = `Nama: ${data.get('nama')}\nEmail: ${data.get('email')}\nKeperluan: ${data.get('subject')}\n\n${data.get('pesan')}`;
    window.location.href = 'mailto:aulapmyid@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });}
if (window.aulapIncludesReady) {
  window.aulapIncludesReady.then(initSite);
} else {
  initSite();
}
