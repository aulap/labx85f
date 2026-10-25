/* Shared HTML components for a static site. No framework or build step. */
(() => {
  'use strict';
  const allowed = new Set(['includes/desktop.html', 'includes/header.html', 'includes/footer.html', 'includes/start-menu.html', 'includes/taskbar.html']);
  const mounts = [...document.querySelectorAll('[data-include]')];
  const load = async (node) => {
    const file = node.dataset.include;
    if (!allowed.has(file)) return;
    try {
      const response = await fetch(file, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const template = document.createElement('template');
      template.innerHTML = html;
      node.replaceWith(template.content.cloneNode(true));
    } catch (error) {
      console.error(`Failed to load ${file}:`, error);
      node.textContent = 'Bagian halaman gagal dimuat. Muat ulang untuk mencoba kembali.';
      node.setAttribute('role', 'status');
    }
  };
  window.aulapIncludesReady = Promise.all(mounts.map(load)).then(() => {
    const filename = location.pathname.split('/').pop() || 'index.html';
    const title = document.title.split(' | ')[0].trim() || 'Aulap Software';
    const titleNode = document.querySelector('[data-window-title]');
    if (titleNode) titleNode.textContent = title;
    // Match the active link without repeating the navigation HTML on every page.
    let navTarget = filename;
    if (!['index.html','software.html','services.html','payment.html','contact.html','about.html'].includes(filename) && document.querySelector('.product-detail')) navTarget = 'software.html';
    document.querySelectorAll('#primary-nav a').forEach(link => {
      if (link.getAttribute('href') === navTarget) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
})();
